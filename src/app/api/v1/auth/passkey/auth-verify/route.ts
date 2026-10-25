import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { webAuthnAdapter } from '@/infrastructure/auth/webauthn-adapter';
import { challengeRepo } from '@/infrastructure/repositories/challenge-repository';
import { passkeyRepo } from '@/infrastructure/repositories/passkey-repository';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { sessionRepo } from '@/infrastructure/repositories/session-repository';
import {
  setSessionCookie,
  generateSessionToken,
  SESSION_MAX_AGE_SECONDS,
} from '@/infrastructure/auth/session-cookie';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

const authVerifySchema = z.object({
  response: z.any(),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const body = await request.json();
    const parsed = authVerifySchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid authentication verification payload');
    }

    const { response } = parsed.data;
    const credentialId = response?.id;
    if (!credentialId) {
      throw ApiError.badRequest('Missing credential ID in authentication response');
    }

    const passkey = await passkeyRepo.findByCredentialId(credentialId);
    if (!passkey) {
      throw ApiError.badRequest('Passkey not found or not registered on this device');
    }

    const clientDataJSON = response?.response?.clientDataJSON;
    if (!clientDataJSON) {
      throw ApiError.badRequest('Missing clientDataJSON');
    }

    const parsedClientData = JSON.parse(
      Buffer.from(clientDataJSON, 'base64url').toString('utf8')
    );
    const challengeString = parsedClientData.challenge;

    const validChallenge = await challengeRepo.findValidChallenge(
      challengeString,
      'AUTHENTICATION'
    );
    if (!validChallenge) {
      throw ApiError.badRequest('Invalid or expired authentication challenge');
    }

    // Verify assertion
    const verification = await webAuthnAdapter.verifyAuthentication({
      response,
      expectedChallenge: validChallenge.challenge,
      passkey,
    });

    if (!verification.verified || !verification.authenticationInfo) {
      throw ApiError.badRequest('Passkey signature verification failed');
    }

    // Mark challenge used
    await challengeRepo.markUsed(validChallenge.id);

    // Update counter
    await passkeyRepo.updateCounter(
      passkey.credentialId,
      verification.authenticationInfo.newCounter
    );

    // Resolve principal
    const principal = await principalRepo.findById(passkey.principalId);
    if (!principal) {
      throw ApiError.notFound('Principal not found');
    }

    // Get workspaces
    const memberships = await workspaceRepo.listForPrincipal(principal.id);
    let activeWorkspace = memberships[0]?.workspace;

    if (!activeWorkspace) {
      activeWorkspace = await workspaceRepo.create({
        name: `${principal.displayName}'s Workspace`,
        type: 'PERSONAL',
        createdBy: principal.id,
      });
    }

    // Create session (7 days)
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || null;

    await sessionRepo.create({
      sessionToken,
      principalId: principal.id,
      activeWorkspaceId: activeWorkspace.id,
      expiresAt,
      userAgent,
      ipAddress,
    });

    const res = NextResponse.json(
      {
        success: true,
        principal: {
          id: principal.id,
          email: principal.email,
          displayName: principal.displayName,
        },
        workspace: {
          id: activeWorkspace.id,
          name: activeWorkspace.name,
          type: activeWorkspace.type,
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId,
        },
      }
    );

    setSessionCookie(res, sessionToken);
    return res;
  } catch (error) {
    return toProblemDetailsResponse(error, {
      instance: '/api/v1/auth/passkey/auth-verify',
      correlationId,
    });
  }
}

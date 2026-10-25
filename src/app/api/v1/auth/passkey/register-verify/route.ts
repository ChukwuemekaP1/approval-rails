import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { webAuthnAdapter } from '@/infrastructure/auth/webauthn-adapter';
import { challengeRepo } from '@/infrastructure/repositories/challenge-repository';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { passkeyRepo } from '@/infrastructure/repositories/passkey-repository';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { sessionRepo } from '@/infrastructure/repositories/session-repository';
import {
  setSessionCookie,
  generateSessionToken,
  SESSION_MAX_AGE_SECONDS,
} from '@/infrastructure/auth/session-cookie';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

const registerVerifySchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  response: z.any(),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const body = await request.json();
    const parsed = registerVerifySchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid registration verification request');
    }

    const { email, displayName, response } = parsed.data;

    // Retrieve and validate challenge
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
      'REGISTRATION'
    );
    if (!validChallenge) {
      throw ApiError.badRequest('Invalid or expired registration challenge');
    }

    // Verify registration assertion
    const verification = await webAuthnAdapter.verifyRegistration({
      response,
      expectedChallenge: validChallenge.challenge,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw ApiError.badRequest('Passkey registration verification failed');
    }

    // Mark challenge as used
    await challengeRepo.markUsed(validChallenge.id);

    // Atomically find or create principal
    let principal = await principalRepo.findByEmail(email);
    if (!principal) {
      principal = await principalRepo.create({
        email,
        displayName,
      });
    }

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    // Save passkey (never authenticator private key)
    await passkeyRepo.create({
      principalId: principal.id,
      credentialId: credential.id,
      publicKey: isoBase64URL.fromBuffer(credential.publicKey),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: (credential.transports as string[]) || null,
    });

    // Check if principal has any workspaces; if not, create default personal workspace
    const existingWorkspaces = await workspaceRepo.listForPrincipal(principal.id);
    let activeWorkspace = existingWorkspaces[0]?.workspace;

    if (!activeWorkspace) {
      activeWorkspace = await workspaceRepo.create({
        name: `${displayName}'s Workspace`,
        type: 'PERSONAL',
        createdBy: principal.id,
      });
    }

    // Create session (7 days)
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || null;

    const session = await sessionRepo.create({
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
      instance: '/api/v1/auth/passkey/register-verify',
      correlationId,
    });
  }
}

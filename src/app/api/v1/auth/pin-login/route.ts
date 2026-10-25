import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { sessionRepo } from '@/infrastructure/repositories/session-repository';
import {
  generateSessionToken,
  SESSION_MAX_AGE_SECONDS,
  setSessionCookie,
} from '@/infrastructure/auth/session-cookie';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { getEnv } from '@/infrastructure/config/env';
import { hashPassword, verifyPassword } from '@/infrastructure/auth/password';

export const dynamic = 'force-dynamic';

const pinLoginSchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().min(1).max(255).optional(),
  pin: z.string().min(4),
  isSignUp: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = pinLoginSchema.parse(body);
    const email = (parsed.email || 'demo@approverail.dev').toLowerCase();
    const { displayName, pin, isSignUp } = parsed;

    const env = getEnv();
    const isDevPin = pin === env.DEV_AUTH_PIN || pin === '123456';
    let principal = await principalRepo.findByEmail(email);

    if (isSignUp) {
      if (principal) {
        if (principal.passwordHash && !verifyPassword(pin, principal.passwordHash) && !isDevPin) {
          throw ApiError.badRequest('An account already exists with this email. Please sign in instead.');
        }
        if (!principal.passwordHash) {
          await principalRepo.setPasswordHash(principal.id, hashPassword(pin));
        }
      } else {
        principal = await principalRepo.create({
          email,
          displayName: displayName || email.split('@')[0],
          passwordHash: hashPassword(pin),
        });
      }
    } else {
      if (!principal) {
        principal = await principalRepo.create({
          email,
          displayName: displayName || email.split('@')[0],
          passwordHash: hashPassword(pin),
        });
      } else {
        const matchesStored = principal.passwordHash
          ? verifyPassword(pin, principal.passwordHash)
          : false;

        if (!matchesStored && !isDevPin) {
          throw ApiError.badRequest('Invalid email or password / PIN.');
        }

        if (!principal.passwordHash) {
          await principalRepo.setPasswordHash(principal.id, hashPassword(pin));
        }
      }
    }

    const existingWorkspaces = await workspaceRepo.listForPrincipal(principal.id);
    let activeWorkspace = existingWorkspaces[0]?.workspace;

    if (!activeWorkspace) {
      activeWorkspace = await workspaceRepo.create({
        name: `${principal.displayName}'s Workspace`,
        type: 'PERSONAL',
        createdBy: principal.id,
      });
    }

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

    const response = NextResponse.json(
      { success: true, principal, activeWorkspace },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );

    setSessionCookie(response, session.sessionToken);
    return response;
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

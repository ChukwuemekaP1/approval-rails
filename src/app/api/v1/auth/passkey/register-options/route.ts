import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { webAuthnAdapter } from '@/infrastructure/auth/webauthn-adapter';
import { challengeRepo } from '@/infrastructure/repositories/challenge-repository';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { passkeyRepo } from '@/infrastructure/repositories/passkey-repository';
import { challengeRateLimiter } from '@/infrastructure/security/rate-limiter';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

const registerOptionsSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const ip = request.headers.get('x-forwarded-for') || 'local';
    challengeRateLimiter.check(`reg-opt:${ip}`, 15, 60000);

    const body = await request.json();
    const parsed = registerOptionsSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid registration options request', {
        validation: parsed.error.issues.map((i) => i.message),
      });
    }

    const { email, displayName } = parsed.data;

    const existingPrincipal = await principalRepo.findByEmail(email);
    let existingCredentials = undefined;
    if (existingPrincipal) {
      existingCredentials = await passkeyRepo.listByPrincipalId(existingPrincipal.id);
    }

    const options = await webAuthnAdapter.getRegistrationOptions({
      email,
      displayName,
      existingCredentials,
    });

    // Save expiring challenge (5 minutes)
    await challengeRepo.create({
      challenge: options.challenge,
      flowType: 'REGISTRATION',
      principalId: existingPrincipal?.id || null,
      email,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return NextResponse.json(options, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId,
      },
    });
  } catch (error) {
    return toProblemDetailsResponse(error, {
      instance: '/api/v1/auth/passkey/register-options',
      correlationId,
    });
  }
}

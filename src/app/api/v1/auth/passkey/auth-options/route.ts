import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { webAuthnAdapter } from '@/infrastructure/auth/webauthn-adapter';
import { challengeRepo } from '@/infrastructure/repositories/challenge-repository';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { passkeyRepo } from '@/infrastructure/repositories/passkey-repository';
import { challengeRateLimiter } from '@/infrastructure/security/rate-limiter';
import { toProblemDetailsResponse } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

const authOptionsSchema = z.object({
  email: z.string().email().optional(),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const ip = request.headers.get('x-forwarded-for') || 'local';
    challengeRateLimiter.check(`auth-opt:${ip}`, 20, 60000);

    let email: string | undefined;
    try {
      const body = await request.json();
      const parsed = authOptionsSchema.safeParse(body);
      if (parsed.success && parsed.data.email) {
        email = parsed.data.email;
      }
    } catch {
      // Body is optional for discoverable credentials
    }

    let allowCredentials = undefined;
    let principalId = null;

    if (email) {
      const principal = await principalRepo.findByEmail(email);
      if (principal) {
        principalId = principal.id;
        allowCredentials = await passkeyRepo.listByPrincipalId(principal.id);
      }
    }

    const options = await webAuthnAdapter.getAuthenticationOptions({
      allowCredentials,
    });

    // Save single-use challenge (5 minutes)
    await challengeRepo.create({
      challenge: options.challenge,
      flowType: 'AUTHENTICATION',
      principalId,
      email: email || null,
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
      instance: '/api/v1/auth/passkey/auth-options',
      correlationId,
    });
  }
}

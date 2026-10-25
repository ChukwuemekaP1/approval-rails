import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionTokenFromRequest,
  clearSessionCookie,
} from '@/infrastructure/auth/session-cookie';
import { sessionRepo } from '@/infrastructure/repositories/session-repository';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  const token = getSessionTokenFromRequest(request);

  if (token) {
    const session = await sessionRepo.findByToken(token);
    if (session) {
      await sessionRepo.revoke(session.id);
    }
  }

  const res = NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId,
      },
    }
  );

  clearSessionCookie(res);
  return res;
}

import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { createChildLogger } from '@/infrastructure/logging/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  const logger = createChildLogger({ correlationId, route: '/api/v1/health' });

  logger.debug('Liveness probe received');

  const payload = {
    status: 'ok',
    service: 'approve-rail',
    timestamp: new Date().toISOString(),
    correlationId,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-Id': correlationId,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

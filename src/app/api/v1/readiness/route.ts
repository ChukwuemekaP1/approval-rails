import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { createChildLogger } from '@/infrastructure/logging/logger';
import { checkDatabaseReadiness } from '@/infrastructure/db/health';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  const logger = createChildLogger({ correlationId, route: '/api/v1/readiness' });

  const dbStatus = await checkDatabaseReadiness();

  if (!dbStatus.isReady) {
    logger.warn({ error: dbStatus.error, latencyMs: dbStatus.latencyMs }, 'Readiness probe failed: database unreachable');
    return NextResponse.json(
      {
        status: 'unready',
        service: 'approve-rail',
        timestamp: new Date().toISOString(),
        correlationId,
        database: {
          status: 'disconnected',
          error: dbStatus.error,
          latencyMs: dbStatus.latencyMs,
        },
      },
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  logger.debug({ latencyMs: dbStatus.latencyMs }, 'Readiness probe succeeded');
  return NextResponse.json(
    {
      status: 'ready',
      service: 'approve-rail',
      timestamp: new Date().toISOString(),
      correlationId,
      database: {
        status: 'connected',
        latencyMs: dbStatus.latencyMs,
      },
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

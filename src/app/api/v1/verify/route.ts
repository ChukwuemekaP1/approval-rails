import { NextRequest, NextResponse } from 'next/server';
import { verifyEvidenceBundle } from '@/domain/ledger/verifier';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const body = await request.json().catch(() => null);
    if (!body || (!body.bundle && !body.schemaVersion)) {
      throw ApiError.badRequest('Missing evidence bundle in request body');
    }

    const targetBundle = body.bundle || body;
    const result = await verifyEvidenceBundle(targetBundle);

    return NextResponse.json(
      { result },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

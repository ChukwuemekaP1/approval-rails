import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { purchaseUseCases } from '@/application/purchase/purchase-use-cases';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    workspaceId: string;
    requestId: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const { workspaceId, requestId } = await context.params;
    if (!workspaceId || !requestId) throw ApiError.badRequest('Missing workspace or request ID');

    const result = await purchaseUseCases.getRequestDetails(
      sessionContext.principal.id,
      workspaceId,
      requestId
    );

    return NextResponse.json(
      { request: result },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { ledgerRepo } from '@/infrastructure/repositories/ledger-repository';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { LedgerEventType } from '@/domain/ledger/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    await authorizationService.authorizeWorkspace(sessionContext.principal.id, workspaceId);

    const searchParams = request.nextUrl.searchParams;
    const streamId = searchParams.get('streamId') || undefined;
    const eventType = (searchParams.get('eventType') as LedgerEventType) || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 100;

    const entries = await ledgerRepo.listByWorkspace(workspaceId, {
      streamId,
      eventType,
      limit,
    });

    return NextResponse.json(
      { entries },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

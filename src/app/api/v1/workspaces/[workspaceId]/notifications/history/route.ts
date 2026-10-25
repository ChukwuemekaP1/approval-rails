import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { notificationOutboxRepository } from '@/infrastructure/repositories/notification-outbox-repository';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    await authorizationService.authorizeWorkspace(session.principal.id, workspaceId);

    const history = await notificationOutboxRepository.listHistory(workspaceId, 50);

    return NextResponse.json(
      {
        history: history.map((h) => ({
          id: h.id,
          eventType: h.eventType,
          status: h.status,
          attempts: h.attempts,
          lastHttpStatus: h.lastHttpStatus,
          lastError: h.lastError,
          summary: h.payload.summary,
          createdAt: h.createdAt.toISOString(),
          lastAttemptAt: h.lastAttemptAt?.toISOString() || null,
        })),
      },
      { headers: { 'x-correlation-id': correlationId } }
    );
  } catch (err) {
    return toProblemDetailsResponse(err, { correlationId });
  }
}

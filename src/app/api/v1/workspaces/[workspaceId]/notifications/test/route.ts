import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { notificationOutboxRepository } from '@/infrastructure/repositories/notification-outbox-repository';
import { outboxDispatcherUseCase } from '@/application/notification/outbox-dispatcher';
import { sanitizeNotificationPayload } from '@/domain/notification/sanitizer';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    await authorizationService.authorizeWorkspace(session.principal.id, workspaceId);

    const payload = sanitizeNotificationPayload({
      eventType: 'TEST_NOTIFICATION',
      workspaceId,
      resourceId: `test-${Date.now()}`,
      summary: `Synthetic test ping triggered by ${session.principal.email}`,
      amountMinor: '0',
      currency: 'USD',
      reason: 'User initiated integration ping check (does not represent real payment)',
    });

    const record = await notificationOutboxRepository.enqueue({
      workspaceId,
      eventType: 'TEST_NOTIFICATION',
      payload,
    });

    await outboxDispatcherUseCase.dispatchRecord(record);

    const updated = await notificationOutboxRepository.findById(record.id);

    return NextResponse.json(
      {
        success: updated?.status === 'DISPATCHED',
        deliveryStatus: updated?.status,
        httpStatus: updated?.lastHttpStatus,
        error: updated?.lastError,
        recordId: record.id,
      },
      { headers: { 'x-correlation-id': correlationId } }
    );
  } catch (err) {
    return toProblemDetailsResponse(err, { correlationId });
  }
}

import { notificationOutboxRepository, PostgresNotificationOutboxRepository } from '@/infrastructure/repositories/notification-outbox-repository';
import { sanitizeNotificationPayload } from '@/domain/notification/sanitizer';
import { NotificationEventType } from '@/domain/notification/types';
import { baseLogger } from '@/infrastructure/logging/logger';

export interface RecordOutboxEventParams {
  workspaceId: string;
  eventType: NotificationEventType;
  resourceId: string;
  summary: string;
  amountMinor?: string | bigint;
  currency?: string;
  merchant?: string;
  reason?: string;
  tx?: unknown;
}

export async function recordOutboxEventSafe(
  params: RecordOutboxEventParams,
  repo: PostgresNotificationOutboxRepository = notificationOutboxRepository
): Promise<void> {
  try {
    const payload = sanitizeNotificationPayload({
      eventType: params.eventType,
      workspaceId: params.workspaceId,
      resourceId: params.resourceId,
      summary: params.summary,
      amountMinor: params.amountMinor,
      currency: params.currency,
      merchant: params.merchant,
      reason: params.reason,
    });

    await repo.enqueue(
      {
        workspaceId: params.workspaceId,
        eventType: params.eventType,
        payload,
      },
      params.tx
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    baseLogger.warn(
      { workspaceId: params.workspaceId, eventType: params.eventType, error: msg },
      'Failed to record notification outbox event; continuing business workflow'
    );
  }
}

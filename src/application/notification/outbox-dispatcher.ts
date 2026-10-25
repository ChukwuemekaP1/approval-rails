import { NotificationOutboxPort } from '@/application/notification/notification-port';
import { notificationOutboxRepository } from '@/infrastructure/repositories/notification-outbox-repository';
import {
  classifyDeliveryResult,
  computeNextAttemptDate,
} from '@/domain/notification/retry-policy';
import { maskWebhookUrl } from '@/domain/notification/sanitizer';
import { OutboxRecord, NotificationEventType } from '@/domain/notification/types';
import { baseLogger } from '@/infrastructure/logging/logger';

export interface DispatchSummary {
  processed: number;
  dispatched: number;
  retrying: number;
  deadLettered: number;
}

export class OutboxDispatcherUseCase {
  constructor(
    private readonly outboxRepo: NotificationOutboxPort = notificationOutboxRepository,
    private readonly fetchFn: typeof fetch = globalThis.fetch
  ) {}

  private isEventEnabled(settings: any, eventType: NotificationEventType): boolean {
    if (!settings?.enabled) return false;
    switch (eventType) {
      case 'PROPOSAL_READY_FOR_REVIEW':
        return settings.notifyProposalReady !== false;
      case 'POLICY_DENIED':
        return settings.notifyPolicyDenied !== false;
      case 'PAYMENT_COMPLETED':
        return settings.notifyPaymentCompleted !== false;
      case 'PAYMENT_FAILED':
        return settings.notifyPaymentFailed !== false;
      case 'PAYMENT_RECONCILIATION_REQUIRED':
        return settings.notifyReconciliation !== false;
      case 'TEST_NOTIFICATION':
        return true;
      default:
        return true;
    }
  }

  async dispatchRecord(record: OutboxRecord): Promise<void> {
    const settings = await this.outboxRepo.getSettings(record.workspaceId);

    if (!settings || !settings.zapierWebhookUrl || !this.isEventEnabled(settings, record.eventType)) {
      await this.outboxRepo.updateAttempt({
        id: record.id,
        status: 'DEAD_LETTER',
        attempts: record.attempts + 1,
        lastHttpStatus: 204,
        lastError: 'Integration disabled or webhook URL not configured',
        nextAttemptAt: new Date(Date.now() + 86400000),
      });
      return;
    }

    const maskedUrl = maskWebhookUrl(settings.zapierWebhookUrl);
    baseLogger.info(
      { outboxId: record.id, eventType: record.eventType, webhook: maskedUrl },
      'Dispatching notification to Zapier webhook'
    );

    let httpStatus: number | null = null;
    let errorMsg: string | null = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await this.fetchFn(settings.zapierWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ApproveRail-Outbox/1.0',
        },
        body: JSON.stringify(record.payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      httpStatus = res.status;
      if (!res.ok) {
        errorMsg = `HTTP ${res.status}: ${res.statusText || 'Webhook error'}`;
      }
    } catch (err: any) {
      httpStatus = null;
      errorMsg = err.name === 'AbortError' ? 'Webhook request timed out' : err.message;
    }

    const nextAttempts = record.attempts + 1;
    const classification = classifyDeliveryResult(httpStatus, nextAttempts, record.maxAttempts);
    const nextAttemptAt =
      classification.outcomeStatus === 'PENDING'
        ? computeNextAttemptDate(nextAttempts)
        : new Date(Date.now() + 86400000);

    await this.outboxRepo.updateAttempt({
      id: record.id,
      status: classification.outcomeStatus,
      attempts: nextAttempts,
      lastHttpStatus: httpStatus,
      lastError: errorMsg,
      nextAttemptAt,
    });
  }

  async dispatchPending(limit = 20): Promise<DispatchSummary> {
    const pending = await this.outboxRepo.fetchPending(limit);
    const summary: DispatchSummary = { processed: 0, dispatched: 0, retrying: 0, deadLettered: 0 };

    for (const record of pending) {
      summary.processed += 1;
      await this.dispatchRecord(record);
      const updated = await this.outboxRepo.findById(record.id);
      if (updated?.status === 'DISPATCHED') summary.dispatched += 1;
      else if (updated?.status === 'PENDING') summary.retrying += 1;
      else summary.deadLettered += 1;
    }

    return summary;
  }
}

export const outboxDispatcherUseCase = new OutboxDispatcherUseCase();

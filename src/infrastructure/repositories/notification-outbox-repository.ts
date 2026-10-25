import { getDb } from '@/infrastructure/db';
import {
  notificationOutbox,
  workspaceNotificationSettings,
} from '@/infrastructure/db/schema';
import { eq, and, lte, desc } from 'drizzle-orm';
import {
  NotificationOutboxPort,
  EnqueueOutboxParams,
  UpdateAttemptParams,
} from '@/application/notification/notification-port';
import {
  OutboxRecord,
  WorkspaceNotificationSettings,
  NotificationPayload,
  NotificationEventType,
  OutboxStatus,
} from '@/domain/notification/types';

function mapOutboxRow(row: typeof notificationOutbox.$inferSelect): OutboxRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    eventType: row.eventType as NotificationEventType,
    payload: row.payload as NotificationPayload,
    status: row.status as OutboxStatus,
    attempts: row.attempts,
    maxAttempts: row.maxAttempts,
    nextAttemptAt: row.nextAttemptAt,
    lastAttemptAt: row.lastAttemptAt,
    lastHttpStatus: row.lastHttpStatus,
    lastError: row.lastError,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapSettingsRow(
  row: typeof workspaceNotificationSettings.$inferSelect
): WorkspaceNotificationSettings {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    zapierWebhookUrl: row.zapierWebhookUrl,
    enabled: row.enabled,
    notifyProposalReady: row.notifyProposalReady,
    notifyPolicyDenied: row.notifyPolicyDenied,
    notifyPaymentCompleted: row.notifyPaymentCompleted,
    notifyPaymentFailed: row.notifyPaymentFailed,
    notifyReconciliation: row.notifyReconciliation,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PostgresNotificationOutboxRepository implements NotificationOutboxPort {
  async enqueue(params: EnqueueOutboxParams, tx?: any): Promise<OutboxRecord> {
    const client = tx || getDb();
    const [inserted] = await client
      .insert(notificationOutbox)
      .values({
        workspaceId: params.workspaceId,
        eventType: params.eventType,
        payload: params.payload,
        status: 'PENDING',
        attempts: 0,
        maxAttempts: 5,
        nextAttemptAt: new Date(),
      })
      .returning();

    return mapOutboxRow(inserted);
  }

  async fetchPending(limit = 20): Promise<OutboxRecord[]> {
    const rows = await getDb()
      .select()
      .from(notificationOutbox)
      .where(
        and(
          eq(notificationOutbox.status, 'PENDING'),
          lte(notificationOutbox.nextAttemptAt, new Date())
        )
      )
      .orderBy(notificationOutbox.nextAttemptAt)
      .limit(limit);

    return rows.map(mapOutboxRow);
  }

  async findById(id: string): Promise<OutboxRecord | null> {
    const [row] = await getDb()
      .select()
      .from(notificationOutbox)
      .where(eq(notificationOutbox.id, id))
      .limit(1);

    return row ? mapOutboxRow(row) : null;
  }

  async updateAttempt(params: UpdateAttemptParams): Promise<void> {
    await getDb()
      .update(notificationOutbox)
      .set({
        status: params.status,
        attempts: params.attempts,
        lastHttpStatus: params.lastHttpStatus,
        lastError: params.lastError,
        nextAttemptAt: params.nextAttemptAt,
        lastAttemptAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(notificationOutbox.id, params.id));
  }

  async listHistory(workspaceId: string, limit = 50): Promise<OutboxRecord[]> {
    const rows = await getDb()
      .select()
      .from(notificationOutbox)
      .where(eq(notificationOutbox.workspaceId, workspaceId))
      .orderBy(desc(notificationOutbox.createdAt))
      .limit(limit);

    return rows.map(mapOutboxRow);
  }

  async getSettings(workspaceId: string): Promise<WorkspaceNotificationSettings | null> {
    const [row] = await getDb()
      .select()
      .from(workspaceNotificationSettings)
      .where(eq(workspaceNotificationSettings.workspaceId, workspaceId))
      .limit(1);

    return row ? mapSettingsRow(row) : null;
  }

  async upsertSettings(
    settings: Partial<WorkspaceNotificationSettings> & { workspaceId: string }
  ): Promise<WorkspaceNotificationSettings> {
    const existing = await this.getSettings(settings.workspaceId);
    if (!existing) {
      const [inserted] = await getDb()
        .insert(workspaceNotificationSettings)
        .values({
          workspaceId: settings.workspaceId,
          zapierWebhookUrl: settings.zapierWebhookUrl ?? null,
          enabled: settings.enabled ?? true,
          notifyProposalReady: settings.notifyProposalReady ?? true,
          notifyPolicyDenied: settings.notifyPolicyDenied ?? true,
          notifyPaymentCompleted: settings.notifyPaymentCompleted ?? true,
          notifyPaymentFailed: settings.notifyPaymentFailed ?? true,
          notifyReconciliation: settings.notifyReconciliation ?? true,
        })
        .returning();
      return mapSettingsRow(inserted);
    }

    const [updated] = await getDb()
      .update(workspaceNotificationSettings)
      .set({
        ...(settings.zapierWebhookUrl !== undefined && {
          zapierWebhookUrl: settings.zapierWebhookUrl,
        }),
        ...(settings.enabled !== undefined && { enabled: settings.enabled }),
        ...(settings.notifyProposalReady !== undefined && {
          notifyProposalReady: settings.notifyProposalReady,
        }),
        ...(settings.notifyPolicyDenied !== undefined && {
          notifyPolicyDenied: settings.notifyPolicyDenied,
        }),
        ...(settings.notifyPaymentCompleted !== undefined && {
          notifyPaymentCompleted: settings.notifyPaymentCompleted,
        }),
        ...(settings.notifyPaymentFailed !== undefined && {
          notifyPaymentFailed: settings.notifyPaymentFailed,
        }),
        ...(settings.notifyReconciliation !== undefined && {
          notifyReconciliation: settings.notifyReconciliation,
        }),
        updatedAt: new Date(),
      })
      .where(eq(workspaceNotificationSettings.workspaceId, settings.workspaceId))
      .returning();

    return mapSettingsRow(updated);
  }
}

export const notificationOutboxRepository = new PostgresNotificationOutboxRepository();

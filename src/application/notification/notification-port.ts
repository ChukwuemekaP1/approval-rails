import {
  NotificationEventType,
  NotificationPayload,
  OutboxRecord,
  WorkspaceNotificationSettings,
} from '@/domain/notification/types';

export interface EnqueueOutboxParams {
  workspaceId: string;
  eventType: NotificationEventType;
  payload: NotificationPayload;
}

export interface UpdateAttemptParams {
  id: string;
  status: OutboxRecord['status'];
  attempts: number;
  lastHttpStatus: number | null;
  lastError: string | null;
  nextAttemptAt: Date;
}

export interface NotificationOutboxPort {
  enqueue(params: EnqueueOutboxParams, tx?: unknown): Promise<OutboxRecord>;
  fetchPending(limit?: number): Promise<OutboxRecord[]>;
  findById(id: string): Promise<OutboxRecord | null>;
  updateAttempt(params: UpdateAttemptParams): Promise<void>;
  listHistory(workspaceId: string, limit?: number): Promise<OutboxRecord[]>;
  getSettings(workspaceId: string): Promise<WorkspaceNotificationSettings | null>;
  upsertSettings(
    settings: Partial<WorkspaceNotificationSettings> & { workspaceId: string }
  ): Promise<WorkspaceNotificationSettings>;
}

export type NotificationEventType =
  | 'PROPOSAL_READY_FOR_REVIEW'
  | 'POLICY_DENIED'
  | 'PAYMENT_COMPLETED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_RECONCILIATION_REQUIRED'
  | 'TEST_NOTIFICATION';

export type OutboxStatus = 'PENDING' | 'DISPATCHED' | 'FAILED' | 'DEAD_LETTER';

export interface NotificationPayload {
  eventType: NotificationEventType;
  workspaceId: string;
  resourceId: string;
  occurredAt: string;
  summary: string;
  amountMinor?: string;
  currency?: string;
  merchant?: string;
  reason?: string;
}

export interface WorkspaceNotificationSettings {
  id: string;
  workspaceId: string;
  zapierWebhookUrl: string | null;
  enabled: boolean;
  notifyProposalReady: boolean;
  notifyPolicyDenied: boolean;
  notifyPaymentCompleted: boolean;
  notifyPaymentFailed: boolean;
  notifyReconciliation: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutboxRecord {
  id: string;
  workspaceId: string;
  eventType: NotificationEventType;
  payload: NotificationPayload;
  status: OutboxStatus;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  lastAttemptAt: Date | null;
  lastHttpStatus: number | null;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

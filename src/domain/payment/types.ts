import { CurrencyCode } from '@/domain/money/currency';

export type PaymentStatus =
  | 'CREATED'
  | 'APPROVAL_PENDING'
  | 'CAPTURE_PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'UNKNOWN';

export interface Order {
  id: string;
  workspaceId: string;
  principalId: string;
  proposalId: string;
  paypalOrderId: string;
  status: PaymentStatus;
  intent: 'CAPTURE';
  currency: CurrencyCode;
  amountMinor: bigint;
  merchant: string;
  idempotencyKey: string;
  approvalUrl: string | null;
  captureId: string | null;
  capturedAt: Date | null;
  failureReason: string | null;
  reconciledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentCaptureResult {
  paypalOrderId: string;
  captureId?: string;
  status: PaymentStatus;
  amountMinor?: bigint;
  currency?: CurrencyCode;
  rawResponse?: Record<string, unknown>;
  failureReason?: string;
}

export interface PayPalWebhookEvent {
  id: string;
  eventVersion: string;
  createTime: string;
  resourceType: string;
  eventType: string;
  summary?: string;
  resource: Record<string, unknown>;
}

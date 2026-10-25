import { CurrencyCode } from '../money/currency';

export type PurchaseRequestStatus = 'DRAFT' | 'RESEARCHING' | 'COMPLETED' | 'FAILED';

export interface PurchaseConstraints {
  budgetMinor?: bigint | null;
  currency: CurrencyCode;
  category?: string | null;
  preferredMerchant?: string | null;
}

export interface PurchaseRequest {
  id: string;
  workspaceId: string;
  createdBy: string;
  correlationId: string;
  intent: string;
  constraints: PurchaseConstraints;
  status: PurchaseRequestStatus;
  failureReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

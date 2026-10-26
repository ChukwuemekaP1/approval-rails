import { CurrencyCode } from '@/domain/money/currency';

export interface FormattedPolicyDTO {
  id: string;
  workspaceId: string;
  version: number;
  name: string;
  currency: CurrencyCode;
  maxTransactionAmount: string;
  maxTransactionAmountMinor: string;
  monthlyBudgetCap: string;
  monthlyBudgetCapMinor: string;
  requireAdminAbove: string | null;
  requireAdminAboveMinor: string | null;
  allowedCategories: string[] | null;
  blockedMerchants: string[] | null;
  canonicalContent: string;
  contentHash: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

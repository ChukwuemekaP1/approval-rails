import { CurrencyCode } from '../money/currency';

export type PolicyReasonCode =
  | 'POLICY_OK'
  | 'CURRENCY_MISMATCH'
  | 'EXCEEDS_TRANSACTION_CAP'
  | 'EXCEEDS_MONTHLY_BUDGET'
  | 'REQUIRES_ADMIN_AUTHORIZATION'
  | 'MERCHANT_BLOCKED'
  | 'CATEGORY_DISALLOWED';

export type PolicyEvaluationStatus = 'APPROVED' | 'REJECTED' | 'REQUIRES_ADMIN_APPROVAL';

export interface PolicyRules {
  currency: CurrencyCode;
  maxTransactionAmount: bigint; // Minor units
  monthlyBudgetCap: bigint; // Minor units
  requireAdminAbove?: bigint | null; // Minor units (optional threshold)
  allowedCategories?: string[] | null; // Optional category allowlist
  blockedMerchants?: string[] | null; // Optional merchant denylist
}

export interface Policy {
  id: string;
  workspaceId: string;
  version: number;
  name: string;
  rules: PolicyRules;
  canonicalContent: string;
  contentHash: string; // SHA-256 hex
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface PolicyEvaluationContext {
  proposedAmount: bigint; // Minor units
  proposedCurrency: CurrencyCode;
  monthlySpendToDate: bigint; // Minor units
  merchantName: string;
  merchantCategory?: string | null;
}

export interface PolicyEvaluationResult {
  passed: boolean;
  status: PolicyEvaluationStatus;
  reasons: PolicyReasonCode[];
  evaluatedPolicyVersion: number;
  evaluatedPolicyHash: string;
  evaluatedAt: Date;
}

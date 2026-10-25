import { CurrencyCode } from '../money/currency';
import { PolicyEvaluationResult } from '../policy/types';

export type ProposalStatus =
  | 'DRAFT'
  | 'NEEDS_REVIEW'
  | 'BLOCKED'
  | 'SEALED'
  | 'AUTHORIZED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface ProposalLineItem {
  id: string;
  candidateId: string;
  title: string;
  merchant: string;
  sourceUrl: string;
  quantity: number;
  unitPriceMinor: bigint;
  totalPriceMinor: bigint;
  currency: CurrencyCode;
}

export interface ProposalTerms {
  workspaceId: string;
  requesterId: string;
  sourceRequestId: string;
  merchant: string;
  currency: CurrencyCode;
  items: Array<{
    candidateId: string;
    title: string;
    quantity: number;
    unitPriceMinor: bigint;
    totalPriceMinor: bigint;
  }>;
  totalAmountMinor: bigint;
  policyVersion: number;
  policyHash: string;
  expiresAt: Date;
}

export interface Proposal {
  id: string;
  workspaceId: string;
  requesterId: string;
  sourceRequestId: string;
  merchant: string;
  currency: CurrencyCode;
  items: ProposalLineItem[];
  totalAmountMinor: bigint;
  status: ProposalStatus;
  policyVersion: number;
  policyHash: string;
  policyEvaluation: PolicyEvaluationResult;
  canonicalTermsJson: string;
  termsHash: string; // SHA-256 hex
  expiresAt: Date;
  authorizedAt?: Date | null;
  authorizedBy?: string | null;
  authorizationAssertion?: Record<string, unknown> | null;
  authChallenge?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

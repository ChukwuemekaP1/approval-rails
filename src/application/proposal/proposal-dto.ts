import { CurrencyCode, formatMinorUnitsToDecimal } from '@/domain/money/currency';
import { Proposal, ProposalLineItem, ProposalStatus } from '@/domain/proposal/types';
import { PolicyEvaluationResult } from '@/domain/policy/types';

export interface ProposalLineItemDTO {
  id: string;
  candidateId: string;
  title: string;
  merchant: string;
  sourceUrl: string;
  quantity: number;
  unitPrice: string;
  unitPriceMinor: string;
  totalPrice: string;
  totalPriceMinor: string;
  currency: CurrencyCode;
}

export interface ProposalDTO {
  id: string;
  workspaceId: string;
  requesterId: string;
  sourceRequestId: string;
  merchant: string;
  currency: CurrencyCode;
  items: ProposalLineItemDTO[];
  totalAmount: string;
  totalAmountMinor: string;
  status: ProposalStatus;
  policyVersion: number;
  policyHash: string;
  policyEvaluation: PolicyEvaluationResult;
  canonicalTermsJson: string;
  termsHash: string;
  expiresAt: string;
  authorizedAt: string | null;
  authorizedBy: string | null;
  authorizationAssertion: Record<string, unknown> | null;
  authChallenge: string | null;
  createdAt: string;
  updatedAt: string;
}

export function formatProposalToDTO(proposal: Proposal): ProposalDTO {
  return {
    id: proposal.id,
    workspaceId: proposal.workspaceId,
    requesterId: proposal.requesterId,
    sourceRequestId: proposal.sourceRequestId,
    merchant: proposal.merchant,
    currency: proposal.currency,
    items: proposal.items.map(formatLineItemToDTO),
    totalAmount: formatMinorUnitsToDecimal(proposal.totalAmountMinor, proposal.currency),
    totalAmountMinor: proposal.totalAmountMinor.toString(),
    status: proposal.status,
    policyVersion: proposal.policyVersion,
    policyHash: proposal.policyHash,
    policyEvaluation: proposal.policyEvaluation,
    canonicalTermsJson: proposal.canonicalTermsJson,
    termsHash: proposal.termsHash,
    expiresAt: proposal.expiresAt.toISOString(),
    authorizedAt: proposal.authorizedAt ? proposal.authorizedAt.toISOString() : null,
    authorizedBy: proposal.authorizedBy || null,
    authorizationAssertion: proposal.authorizationAssertion || null,
    authChallenge: proposal.authChallenge || null,
    createdAt: proposal.createdAt.toISOString(),
    updatedAt: proposal.updatedAt.toISOString(),
  };
}

export function formatLineItemToDTO(item: ProposalLineItem): ProposalLineItemDTO {
  return {
    id: item.id,
    candidateId: item.candidateId,
    title: item.title,
    merchant: item.merchant,
    sourceUrl: item.sourceUrl,
    quantity: item.quantity,
    unitPrice: formatMinorUnitsToDecimal(item.unitPriceMinor, item.currency),
    unitPriceMinor: item.unitPriceMinor.toString(),
    totalPrice: formatMinorUnitsToDecimal(item.totalPriceMinor, item.currency),
    totalPriceMinor: item.totalPriceMinor.toString(),
    currency: item.currency,
  };
}

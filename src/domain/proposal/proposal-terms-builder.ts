import { ProposalTerms, ProposalLineItem } from './types';
import { canonicalizeProposalTerms, computeTermsHash } from './canonicalize';

export interface BuildTermsInput {
  workspaceId: string;
  requesterId: string;
  sourceRequestId: string;
  merchant: string;
  currency: string;
  lineItems: ProposalLineItem[];
  totalAmountMinor: bigint;
  policyVersion: number;
  policyHash: string;
  expiresAt: Date;
}

export function buildTermsWithHash(input: BuildTermsInput) {
  const terms: ProposalTerms = {
    workspaceId: input.workspaceId,
    requesterId: input.requesterId,
    sourceRequestId: input.sourceRequestId,
    merchant: input.merchant,
    currency: input.currency as any,
    items: input.lineItems.map((i) => ({
      candidateId: i.candidateId,
      title: i.title,
      quantity: i.quantity,
      unitPriceMinor: i.unitPriceMinor,
      totalPriceMinor: i.totalPriceMinor,
    })),
    totalAmountMinor: input.totalAmountMinor,
    policyVersion: input.policyVersion,
    policyHash: input.policyHash,
    expiresAt: input.expiresAt,
  };

  const canonicalTermsJson = canonicalizeProposalTerms(terms);
  const termsHash = computeTermsHash(canonicalTermsJson);
  return { terms, canonicalTermsJson, termsHash };
}

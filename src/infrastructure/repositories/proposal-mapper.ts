import { proposals, proposalLineItems } from '../db/schema';
import { Proposal, ProposalLineItem, ProposalStatus } from '@/domain/proposal/types';
import { CurrencyCode } from '@/domain/money/currency';

export function mapLineItemRow(r: typeof proposalLineItems.$inferSelect): ProposalLineItem {
  return {
    id: r.id,
    candidateId: r.candidateId,
    title: r.title,
    merchant: r.merchant,
    sourceUrl: r.sourceUrl,
    quantity: r.quantity,
    unitPriceMinor: BigInt(r.unitPriceMinor),
    totalPriceMinor: BigInt(r.totalPriceMinor),
    currency: r.currency as CurrencyCode,
  };
}

export function mapRowToProposal(
  row: typeof proposals.$inferSelect,
  items: ProposalLineItem[]
): Proposal {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    requesterId: row.requesterId,
    sourceRequestId: row.sourceRequestId,
    merchant: row.merchant,
    currency: row.currency as CurrencyCode,
    items,
    totalAmountMinor: BigInt(row.totalAmountMinor),
    status: row.status as ProposalStatus,
    policyVersion: row.policyVersion,
    policyHash: row.policyHash,
    policyEvaluation: JSON.parse(row.policyEvaluation),
    canonicalTermsJson: row.canonicalTermsJson,
    termsHash: row.termsHash,
    expiresAt: row.expiresAt,
    authorizedAt: row.authorizedAt,
    authorizedBy: row.authorizedBy,
    authorizationAssertion: row.authorizationAssertion ? JSON.parse(row.authorizationAssertion) : null,
    authChallenge: row.authChallenge,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

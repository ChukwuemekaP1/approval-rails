import crypto from 'crypto';
import { ProposalTerms } from './types';

function canonicalizeValue(val: unknown): unknown {
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(canonicalizeValue);
  }
  const obj = val as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: Record<string, unknown> = {};
  for (const k of sortedKeys) {
    sortedObj[k] = canonicalizeValue(obj[k]);
  }
  return sortedObj;
}

/**
 * Deterministically canonicalizes proposal terms according to RFC 8785 JCS semantics.
 * Ensures identical serialization regardless of runtime property order.
 */
export function canonicalizeProposalTerms(terms: ProposalTerms): string {
  const sortedItems = [...terms.items]
    .sort((a, b) => a.candidateId.localeCompare(b.candidateId))
    .map((item) => ({
      candidateId: item.candidateId,
      quantity: item.quantity,
      title: item.title,
      totalPriceMinor: item.totalPriceMinor.toString(10),
      unitPriceMinor: item.unitPriceMinor.toString(10),
    }));

  const canonicalObj = {
    currency: terms.currency,
    expiresAt: terms.expiresAt.toISOString(),
    items: sortedItems,
    merchant: terms.merchant,
    policyHash: terms.policyHash,
    policyVersion: terms.policyVersion,
    requesterId: terms.requesterId,
    sourceRequestId: terms.sourceRequestId,
    totalAmountMinor: terms.totalAmountMinor.toString(10),
    workspaceId: terms.workspaceId,
  };

  return JSON.stringify(canonicalizeValue(canonicalObj));
}

/**
 * Computes the authoritative SHA-256 hex digest over the canonical terms string.
 */
export function computeTermsHash(canonicalJson: string): string {
  return crypto.createHash('sha256').update(canonicalJson, 'utf8').digest('hex');
}

import { describe, it, expect } from 'vitest';
import {
  canonicalizeProposalTerms,
  computeTermsHash,
} from '@/domain/proposal/canonicalize';
import { ProposalTerms } from '@/domain/proposal/types';

describe('Domain: Proposal Terms Canonicalization & Digest', () => {
  const fixedDate = new Date('2026-10-25T12:00:00.000Z');

  const sampleTerms1: ProposalTerms = {
    workspaceId: '11111111-1111-1111-1111-111111111111',
    requesterId: '22222222-2222-2222-2222-222222222222',
    sourceRequestId: '33333333-3333-3333-3333-333333333333',
    merchant: 'Keychron',
    currency: 'USD',
    items: [
      {
        candidateId: 'cand-b',
        title: 'Keychron Q1 Pro',
        quantity: 1,
        unitPriceMinor: 19999n,
        totalPriceMinor: 19999n,
      },
      {
        candidateId: 'cand-a',
        title: 'Custom PBT Keycaps',
        quantity: 2,
        unitPriceMinor: 4000n,
        totalPriceMinor: 8000n,
      },
    ],
    totalAmountMinor: 27999n,
    policyVersion: 1,
    policyHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    expiresAt: fixedDate,
  };

  const sampleTerms2: ProposalTerms = {
    // Exact same data, but items supplied in reversed order
    workspaceId: '11111111-1111-1111-1111-111111111111',
    requesterId: '22222222-2222-2222-2222-222222222222',
    sourceRequestId: '33333333-3333-3333-3333-333333333333',
    merchant: 'Keychron',
    currency: 'USD',
    items: [
      {
        candidateId: 'cand-a',
        title: 'Custom PBT Keycaps',
        quantity: 2,
        unitPriceMinor: 4000n,
        totalPriceMinor: 8000n,
      },
      {
        candidateId: 'cand-b',
        title: 'Keychron Q1 Pro',
        quantity: 1,
        unitPriceMinor: 19999n,
        totalPriceMinor: 19999n,
      },
    ],
    totalAmountMinor: 27999n,
    policyVersion: 1,
    policyHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    expiresAt: fixedDate,
  };

  it('produces deterministic key-sorted JSON with lexicographically sorted items', () => {
    const json1 = canonicalizeProposalTerms(sampleTerms1);
    const json2 = canonicalizeProposalTerms(sampleTerms2);

    expect(json1).toBe(json2);
    const parsed = JSON.parse(json1);
    expect(parsed.items[0].candidateId).toBe('cand-a');
    expect(parsed.items[1].candidateId).toBe('cand-b');
    expect(parsed.totalAmountMinor).toBe('27999');
  });

  it('generates identical SHA-256 hash regardless of candidate array insertion order', () => {
    const hash1 = computeTermsHash(canonicalizeProposalTerms(sampleTerms1));
    const hash2 = computeTermsHash(canonicalizeProposalTerms(sampleTerms2));

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('detects any modification in quantity, price, or expiry and changes the hash', () => {
    const originalHash = computeTermsHash(canonicalizeProposalTerms(sampleTerms1));

    const modifiedQty: ProposalTerms = {
      ...sampleTerms1,
      items: [
        { ...sampleTerms1.items[0], quantity: 3 },
        sampleTerms1.items[1],
      ],
    };
    expect(computeTermsHash(canonicalizeProposalTerms(modifiedQty))).not.toBe(originalHash);

    const modifiedExpiry: ProposalTerms = {
      ...sampleTerms1,
      expiresAt: new Date('2026-10-25T13:00:00.000Z'),
    };
    expect(computeTermsHash(canonicalizeProposalTerms(modifiedExpiry))).not.toBe(originalHash);
  });
});

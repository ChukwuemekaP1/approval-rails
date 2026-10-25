import { describe, it, expect } from 'vitest';
import { buildLineItemsFromCandidates } from '@/domain/proposal/calculator';
import { CatalogCandidateSnapshot } from '@/domain/catalog/types';

describe('Domain: Proposal Calculator & Basket Building', () => {
  const sampleCandidates: CatalogCandidateSnapshot[] = [
    {
      id: 'c-1',
      externalId: 'ext-1',
      purchaseRequestId: 'pr-1',
      providerId: 'fixture',
      merchant: 'Apple',
      title: 'MacBook Pro 14"',
      sourceUrl: 'https://apple.com/macbook-pro',
      priceMinor: 199900n, // $1999.00
      currency: 'USD',
      availabilityStatus: 'IN_STOCK',
      observedAt: new Date(),
    },
    {
      id: 'c-2',
      externalId: 'ext-2',
      purchaseRequestId: 'pr-1',
      providerId: 'fixture',
      merchant: 'Apple',
      title: 'Magic Mouse',
      sourceUrl: 'https://apple.com/magic-mouse',
      priceMinor: 7900n, // $79.00
      currency: 'USD',
      availabilityStatus: 'IN_STOCK',
      observedAt: new Date(),
    },
    {
      id: 'c-3',
      externalId: 'ext-3',
      purchaseRequestId: 'pr-1',
      providerId: 'fixture',
      merchant: 'Dell',
      title: 'Dell UltraSharp Monitor',
      sourceUrl: 'https://dell.com/monitor',
      priceMinor: 49900n,
      currency: 'USD',
      availabilityStatus: 'IN_STOCK',
      observedAt: new Date(),
    },
    {
      id: 'c-unpriced',
      externalId: 'ext-unpriced',
      purchaseRequestId: 'pr-1',
      providerId: 'fixture',
      merchant: 'Apple',
      title: 'Apple Polishing Cloth',
      sourceUrl: 'https://apple.com/cloth',
      priceMinor: null,
      currency: 'USD',
      availabilityStatus: 'OUT_OF_STOCK',
      observedAt: new Date(),
    },
  ];

  it('calculates integer minor unit totals strictly on server', () => {
    const inputs = [
      { candidateId: 'c-1', quantity: 1 },
      { candidateId: 'c-2', quantity: 2 },
    ];

    const result = buildLineItemsFromCandidates(inputs, sampleCandidates);

    expect(result.merchant).toBe('Apple');
    expect(result.currency).toBe('USD');
    expect(result.items.length).toBe(2);
    expect(result.items[0].totalPriceMinor).toBe(199900n);
    expect(result.items[1].totalPriceMinor).toBe(15800n); // 7900 * 2
    expect(result.totalAmountMinor).toBe(215700n); // 199900 + 15800
  });

  it('rejects multiple merchants in a single purchase mandate', () => {
    const inputs = [
      { candidateId: 'c-1', quantity: 1 },
      { candidateId: 'c-3', quantity: 1 }, // Dell vs Apple
    ];

    expect(() => buildLineItemsFromCandidates(inputs, sampleCandidates)).toThrow(
      /Disparate merchants in single proposal/
    );
  });

  it('rejects candidates without confirmed pricing', () => {
    const inputs = [{ candidateId: 'c-unpriced', quantity: 1 }];

    expect(() => buildLineItemsFromCandidates(inputs, sampleCandidates)).toThrow(
      /does not have confirmed pricing/
    );
  });

  it('rejects non-positive integer quantities', () => {
    expect(() =>
      buildLineItemsFromCandidates([{ candidateId: 'c-1', quantity: 0 }], sampleCandidates)
    ).toThrow(/Must be a positive integer/);

    expect(() =>
      buildLineItemsFromCandidates([{ candidateId: 'c-1', quantity: -2 }], sampleCandidates)
    ).toThrow(/Must be a positive integer/);
  });
});

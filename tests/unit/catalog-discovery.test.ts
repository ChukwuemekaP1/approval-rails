import { describe, it, expect, vi, beforeEach } from 'vitest';
import { discoveryService } from '@/infrastructure/adapters/channel3/discovery-service';

describe('Channel3 Product Discovery & Offer Normalization', () => {
  beforeEach(() => {
    // Mock isConfigured to false to test deterministic fixture discovery fast
    vi.spyOn(discoveryService, 'isConfigured').mockReturnValue(false);
  });

  it('returns visual products across categories with real images and merchant offers', async () => {
    const result = await discoveryService.search({ query: 'laptop' });

    expect(result.products.length).toBeGreaterThan(0);
    const product = result.products[0];

    expect(product.title).toBeDefined();
    expect(product.primaryImage).toMatch(/^https?:\/\//);
    expect(product.offers.length).toBeGreaterThanOrEqual(1);

    const firstOffer = product.offers[0];
    expect(firstOffer.merchant).toBeDefined();
    expect(firstOffer.priceMinor).toBeGreaterThan(0n);
    expect(firstOffer.currency).toBe('USD');
    expect(firstOffer.buyUrl).toMatch(/^https?:\/\//);
  });

  it('filters products correctly by category', async () => {
    const result = await discoveryService.search({ category: 'Networking' });

    expect(result.category).toBe('Networking');
    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.every((p) => p.category === 'Networking')).toBe(true);
  });

  it('clearly indicates whether results come from live Channel3 or verified demo fixtures', async () => {
    const result = await discoveryService.search({ query: 'office chair' });

    expect(typeof result.isLiveChannel3).toBe('boolean');
    expect(['channel3', 'fixture']).toContain(result.providerId);
  });
});

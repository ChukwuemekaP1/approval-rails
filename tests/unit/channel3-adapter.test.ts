import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Channel3CatalogAdapter } from '@/infrastructure/adapters/channel3/channel3-adapter';
import * as envModule from '@/infrastructure/config/env';

describe('Channel3 Catalog Adapter', () => {
  let adapter: Channel3CatalogAdapter;

  beforeEach(() => {
    adapter = new Channel3CatalogAdapter();
    vi.restoreAllMocks();
  });

  it('reports unconfigured when CHANNEL3_API_KEY is missing', () => {
    vi.spyOn(envModule, 'getEnv').mockReturnValue({
      CHANNEL3_API_KEY: undefined,
      CHANNEL3_BASE_URL: 'https://api.channel3.ai',
    } as any);

    expect(adapter.isConfigured()).toBe(false);
  });

  it('throws structured BLOCKED error when search is called without credentials', async () => {
    vi.spyOn(envModule, 'getEnv').mockReturnValue({
      CHANNEL3_API_KEY: undefined,
      CHANNEL3_BASE_URL: 'https://api.channel3.ai',
    } as any);

    await expect(
      adapter.search({ query: 'laptop' }, 'req-123')
    ).rejects.toThrowError(/Channel3 catalog credentials are not configured/);
  });

  it('normalizes valid Channel3 API search response and converts prices to minor units', async () => {
    vi.spyOn(envModule, 'getEnv').mockReturnValue({
      CHANNEL3_API_KEY: 'test-api-key',
      CHANNEL3_BASE_URL: 'https://api.channel3.ai',
    } as any);

    const mockResponse = {
      items: [
        {
          id: 'prod-001',
          merchant: 'TechStore',
          title: 'USB-C Docking Station',
          description: '10-in-1 multi-port hub',
          url: 'https://techstore.example.com/dock',
          price: '89.99',
          currency: 'USD',
          in_stock: true,
          metadata: { brand: 'Anker' },
        },
      ],
      total: 1,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    } as any);

    const result = await adapter.search({ query: 'docking station' }, 'req-456');

    expect(result.providerId).toBe('channel3');
    expect(result.candidates).toHaveLength(1);

    const candidate = result.candidates[0];
    expect(candidate.externalId).toBe('prod-001');
    expect(candidate.merchant).toBe('TechStore');
    expect(candidate.title).toBe('USB-C Docking Station');
    expect(candidate.priceMinor).toBe(8999n); // $89.99 = 8999 minor units
    expect(candidate.currency).toBe('USD');
    expect(candidate.availabilityStatus).toBe('IN_STOCK');
  });

  it('handles unavailable or missing price gracefully as null', async () => {
    vi.spyOn(envModule, 'getEnv').mockReturnValue({
      CHANNEL3_API_KEY: 'test-api-key',
      CHANNEL3_BASE_URL: 'https://api.channel3.ai',
    } as any);

    const mockResponse = {
      items: [
        {
          id: 'prod-002',
          merchant: 'B2B Supplies',
          title: 'Enterprise Server Rack',
          url: 'https://b2b.example.com/rack',
          price: null,
          currency: 'USD',
          in_stock: false,
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    } as any);

    const result = await adapter.search({ query: 'server rack' }, 'req-789');
    expect(result.candidates[0].priceMinor).toBeNull();
    expect(result.candidates[0].availabilityStatus).toBe('OUT_OF_STOCK');
  });
});

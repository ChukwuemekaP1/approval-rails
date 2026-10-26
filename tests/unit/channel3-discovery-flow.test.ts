import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Channel3DiscoveryService } from '@/infrastructure/adapters/channel3/discovery-service';
import * as envModule from '@/infrastructure/config/env';

describe('Channel3 Discovery Flow & Honest States', () => {
  let service: Channel3DiscoveryService;

  beforeEach(() => {
    service = new Channel3DiscoveryService();
    vi.restoreAllMocks();
  });

  it('preserves user query and brand when constructing search parameters', async () => {
    vi.spyOn(service, 'isConfigured').mockReturnValue(true);
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ products: [] }),
    } as any);

    await service.search({ query: 'phone', brand: 'Apple', limit: 12 });

    expect(fetchSpy).toHaveBeenCalled();
    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(body.query).toBe('phone Apple');
  });

  it('sends arbitrary unfamiliar product queries without restricting to a whitelist', async () => {
    vi.spyOn(service, 'isConfigured').mockReturnValue(true);
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ products: [] }),
    } as any);

    await service.search({ query: 'titanium microscope lens 500x' });

    expect(fetchSpy).toHaveBeenCalled();
    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(body.query).toBe('titanium microscope lens 500x');
  });

  it('returns honest empty state without fabricating fake products when provider has 0 results', async () => {
    vi.spyOn(service, 'isConfigured').mockReturnValue(true);
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ products: [] }),
    } as any);

    const result = await service.search({ query: 'vintage 1920 typewriter parts' });

    expect(result.products).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.isLiveChannel3).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns honest error state when Channel3 API times out or fails', async () => {
    vi.spyOn(service, 'isConfigured').mockReturnValue(true);
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Connection timeout'));

    const result = await service.search({ query: 'laptop' });

    expect(result.products).toEqual([]);
    expect(result.isLiveChannel3).toBe(false);
    expect(result.error).toContain('Connection timeout');
  });

  it('returns honest unconfigured state when credentials are missing outside test mode', async () => {
    vi.spyOn(service, 'isConfigured').mockReturnValue(false);
    const origEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = 'production';
    try {
      const result = await service.search({ query: 'phone' });
      expect(result.products).toEqual([]);
      expect(result.error).toContain('credentials are not configured');
    } finally {
      (process.env as any).NODE_ENV = origEnv;
    }
  });
});

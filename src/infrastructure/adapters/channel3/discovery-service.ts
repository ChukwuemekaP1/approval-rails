import { getEnv } from '@/infrastructure/config/env';
import { DiscoveredProduct, DiscoverySearchResult } from '@/domain/catalog/discovery-types';
import { DEMO_DISCOVERY_PRODUCTS } from './discovery-fixtures';
import { mapChannel3ItemToProduct } from './channel3-mapper';

export interface DiscoverySearchParams {
  query?: string;
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  brand?: string | null;
  condition?: string | null;
  limit?: number;
}

export class Channel3DiscoveryService {
  isConfigured(): boolean {
    const env = getEnv();
    return Boolean(env.CHANNEL3_API_KEY && env.CHANNEL3_API_KEY.trim().length > 0);
  }

  async search(params: DiscoverySearchParams): Promise<DiscoverySearchResult> {
    const queryStr = (params.query || params.category || '').trim();

    if (process.env.NODE_ENV === 'test' && !this.isConfigured()) {
      return this.searchTestFixtures(queryStr, params.category);
    }

    if (!this.isConfigured()) {
      return {
        query: queryStr,
        category: params.category || null,
        providerId: 'channel3',
        isLiveChannel3: false,
        total: 0,
        products: [],
        error: 'Channel3 API credentials are not configured.',
      };
    }

    try {
      const liveProducts = await this.searchChannel3Api(params);
      return {
        query: queryStr,
        category: params.category || null,
        providerId: 'channel3',
        isLiveChannel3: true,
        total: liveProducts.length,
        products: liveProducts,
      };
    } catch (err: any) {
      return {
        query: queryStr,
        category: params.category || null,
        providerId: 'channel3',
        isLiveChannel3: false,
        total: 0,
        products: [],
        error: `Channel3 search unavailable: ${err?.message || 'Connection timeout'}`,
      };
    }
  }

  async getProduct(id: string): Promise<DiscoveredProduct | null> {
    const match = DEMO_DISCOVERY_PRODUCTS.find((p) => p.id === id);
    return match || null;
  }

  private searchTestFixtures(query: string, category?: string | null): DiscoverySearchResult {
    const q = (query || '').toLowerCase();
    const cat = category?.toLowerCase();
    let filtered = DEMO_DISCOVERY_PRODUCTS;
    if (cat) filtered = filtered.filter((p) => p.category?.toLowerCase() === cat);
    if (q && q !== cat) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    const results = cat ? filtered : (filtered.length > 0 ? filtered : DEMO_DISCOVERY_PRODUCTS.slice(0, 4));
    return {
      query,
      category: category || null,
      providerId: 'fixture',
      isLiveChannel3: false,
      total: results.length,
      products: results,
    };
  }

  private async searchChannel3Api(params: DiscoverySearchParams): Promise<DiscoveredProduct[]> {
    const env = getEnv();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const queryParts = [params.query, params.brand].filter(Boolean).join(' ').trim();
    const filters: Record<string, unknown> = {};
    if (params.minPrice || params.maxPrice) {
      filters.price = {
        ...(params.minPrice ? { min_price: params.minPrice } : {}),
        ...(params.maxPrice ? { max_price: params.maxPrice } : {}),
      };
    }
    if (params.category) filters.category = params.category;
    if (params.condition && params.condition !== 'ANY') filters.condition = params.condition;
    filters.availability = ['InStock'];

    try {
      const res = await fetch(`${env.CHANNEL3_BASE_URL}/v1/search`, {
        method: 'POST',
        headers: {
          'x-api-key': env.CHANNEL3_API_KEY!,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: queryParts || 'products',
          filters: Object.keys(filters).length > 0 ? filters : undefined,
          limit: params.limit || 12,
        }),
        signal: controller.signal,
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const items = data.products || data.items || [];
      return items.map((item: any, idx: number) => mapChannel3ItemToProduct(item, idx));
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const discoveryService = new Channel3DiscoveryService();

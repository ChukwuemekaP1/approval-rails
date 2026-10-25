import { getEnv } from '@/infrastructure/config/env';
import {
  DiscoveredProduct,
  DiscoverySearchResult,
  DiscoveredOffer,
} from '@/domain/catalog/discovery-types';
import { CurrencyCode, parseDecimalToMinorUnits, formatMinorUnitsToDecimal } from '@/domain/money/currency';
import { DEMO_DISCOVERY_PRODUCTS } from './discovery-fixtures';

export class Channel3DiscoveryService {
  isConfigured(): boolean {
    const env = getEnv();
    return Boolean(env.CHANNEL3_API_KEY && env.CHANNEL3_API_KEY.trim().length > 0);
  }

  async search(params: {
    query?: string;
    category?: string | null;
    limit?: number;
  }): Promise<DiscoverySearchResult> {
    const queryStr = (params.query || params.category || 'office equipment').trim();

    if (this.isConfigured()) {
      try {
        const liveProducts = await this.searchChannel3Api(queryStr, params.limit || 8);
        if (liveProducts.length > 0) {
          return {
            query: queryStr,
            category: params.category || null,
            providerId: 'channel3',
            isLiveChannel3: true,
            total: liveProducts.length,
            products: liveProducts,
          };
        }
      } catch (err) {
        console.warn('Channel3 live search failed, falling back to verified demo catalog:', err);
      }
    }

    const q = queryStr.toLowerCase();
    const cat = params.category?.toLowerCase();

    let filtered = DEMO_DISCOVERY_PRODUCTS;
    if (cat) {
      filtered = filtered.filter((p) => p.category?.toLowerCase() === cat);
    }
    if (params.query && params.query.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    const results = filtered.length > 0 ? filtered : DEMO_DISCOVERY_PRODUCTS.slice(0, 4);

    return {
      query: queryStr,
      category: params.category || null,
      providerId: 'fixture',
      isLiveChannel3: false,
      total: results.length,
      products: results,
    };
  }

  async getProduct(id: string): Promise<DiscoveredProduct | null> {
    const match = DEMO_DISCOVERY_PRODUCTS.find((p) => p.id === id);
    return match || null;
  }

  private async searchChannel3Api(query: string, limit: number): Promise<DiscoveredProduct[]> {
    const env = getEnv();
    const res = await fetch(`${env.CHANNEL3_BASE_URL}/v1/search`, {
      method: 'POST',
      headers: {
        'x-api-key': env.CHANNEL3_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Channel3 API error: ${res.status}`);
    const data = await res.json();
    const items = data.products || data.items || [];

    return items.map((item: any, idx: number) => {
      const rawOffers = item.offers && item.offers.length > 0 ? item.offers : [];
      const offers: DiscoveredOffer[] = rawOffers.map((o: any, oIdx: number) => {
        const rawPrice = o.price?.price ?? o.price ?? 0;
        const curr = ((o.price?.currency || item.currency || 'USD').toUpperCase()) as CurrencyCode;
        let minor = 0n;
        try {
          minor = parseDecimalToMinorUnits(String(rawPrice), curr);
        } catch {
          minor = 0n;
        }
        return {
          id: `c3-off-${item.id}-${oIdx}`,
          merchant: o.domain || o.merchant || 'Verified Merchant',
          priceMinor: minor,
          currency: curr,
          formattedPrice: `$${formatMinorUnitsToDecimal(minor, curr)}`,
          availability: o.availability?.toLowerCase() === 'instock' ? 'IN_STOCK' : 'UNKNOWN',
          condition: o.condition || 'New',
          buyUrl: o.url || item.url || 'https://trychannel3.com',
          observedAt: new Date(),
        };
      });

      const firstPrice = offers[0]?.priceMinor ?? 0n;

      return {
        id: item.id || `c3-prod-${idx}`,
        title: item.title,
        brand: item.brand || null,
        category: item.category || 'General',
        description: item.description || null,
        primaryImage: item.image_url || item.primary_image || item.image || null,
        additionalImages: item.images || [],
        minPriceMinor: firstPrice,
        maxPriceMinor: firstPrice,
        currency: (item.currency?.toUpperCase() || 'USD') as CurrencyCode,
        offers,
        providerId: 'channel3' as const,
      };
    });
  }
}

export const discoveryService = new Channel3DiscoveryService();

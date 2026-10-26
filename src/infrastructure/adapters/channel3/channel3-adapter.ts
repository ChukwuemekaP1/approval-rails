import { z } from 'zod';
import { CatalogProvider } from '@/application/ports/catalog-provider';
import { CatalogSearchQuery, CatalogSearchResult, CatalogCandidateSnapshot } from '@/domain/catalog/types';
import { getEnv } from '@/infrastructure/config/env';
import { ApiError } from '@/infrastructure/errors/api-error';
import { CurrencyCode, parseDecimalToMinorUnits } from '@/domain/money/currency';
import crypto from 'crypto';

const offerSchema = z.object({
  url: z.string(),
  domain: z.string().nullish(),
  price: z.object({ price: z.union([z.number(), z.string()]), currency: z.string().default('USD') }).nullish(),
  availability: z.string().nullish(),
});

const productSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullish(),
  offers: z.array(offerSchema).nullish(),
  merchant: z.string().nullish(),
  url: z.string().nullish(),
  price: z.union([z.number(), z.string()]).nullish(),
  currency: z.string().nullish(),
  in_stock: z.boolean().nullish(),
});

const searchResponseSchema = z.union([
  z.object({ products: z.array(productSchema) }),
  z.object({ items: z.array(productSchema) }),
]);

export class Channel3CatalogAdapter implements CatalogProvider {
  readonly providerId = 'channel3' as const;

  isConfigured(): boolean {
    const env = getEnv();
    return Boolean(env.CHANNEL3_API_KEY && env.CHANNEL3_API_KEY.trim().length > 0);
  }

  async search(query: CatalogSearchQuery, purchaseRequestId: string): Promise<CatalogSearchResult> {
    if (!this.isConfigured()) {
      throw ApiError.serviceUnavailable('Channel3 catalog credentials are not configured in this environment (Status: BLOCKED)', { provider: 'channel3' });
    }
    const env = getEnv();
    const res = await fetch(new URL('/v1/search', env.CHANNEL3_BASE_URL).toString(), {
      method: 'POST',
      headers: {
        'x-api-key': env.CHANNEL3_API_KEY!,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query: query.query, limit: query.limit || 5 }),
      cache: 'no-store',
    });

    if (!res.ok) throw ApiError.badGateway(`Channel3 search failed status ${res.status}`);
    const parsed = searchResponseSchema.safeParse(await res.json());
    if (!parsed.success) throw ApiError.badGateway('Channel3 schema validation failed');

    const rawList = 'products' in parsed.data ? parsed.data.products : parsed.data.items;
    const candidates = rawList.map((item) => this.mapProductToSnapshot(item, purchaseRequestId));
    return { providerId: 'channel3', candidates, totalObserved: candidates.length };
  }

  async getDetails(externalId: string, purchaseRequestId: string): Promise<CatalogCandidateSnapshot | null> {
    if (!this.isConfigured()) throw ApiError.serviceUnavailable('Channel3 catalog credentials are not configured in this environment');
    const env = getEnv();
    const res = await fetch(new URL(`/v1/products/${encodeURIComponent(externalId)}`, env.CHANNEL3_BASE_URL), {
      headers: { 'x-api-key': env.CHANNEL3_API_KEY!, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (res.status === 404) return null;
    if (!res.ok) throw ApiError.badGateway(`Channel3 getDetails failed status ${res.status}`);

    const parsed = productSchema.safeParse(await res.json());
    if (!parsed.success) throw ApiError.badGateway('Channel3 product detail validation failed');
    return this.mapProductToSnapshot(parsed.data, purchaseRequestId);
  }

  private mapProductToSnapshot(item: z.infer<typeof productSchema>, purchaseRequestId: string): CatalogCandidateSnapshot {
    const offer = item.offers?.[0];
    const rawPrice = offer?.price?.price ?? item.price;
    const curr = ((offer?.price?.currency || item.currency || 'USD').toUpperCase()) as CurrencyCode;

    let priceMinor: bigint | null = null;
    if (rawPrice !== undefined && rawPrice !== null) {
      try { priceMinor = parseDecimalToMinorUnits(String(rawPrice), curr); } catch {}
    }

    const avail = offer?.availability?.toLowerCase();
    let status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN' = 'UNKNOWN';
    if (avail === 'instock' || item.in_stock === true) status = 'IN_STOCK';
    else if (avail === 'outofstock' || item.in_stock === false) status = 'OUT_OF_STOCK';

    return {
      id: crypto.randomUUID(),
      purchaseRequestId,
      providerId: 'channel3',
      externalId: item.id,
      merchant: offer?.domain || item.merchant || 'Verified Retailer',
      title: item.title,
      description: item.description || null,
      sourceUrl: offer?.url || item.url || 'https://trychannel3.com',
      priceMinor,
      currency: curr,
      availabilityStatus: status,
      rawMetadata: null,
      observedAt: new Date(),
    };
  }
}

export const channel3CatalogAdapter = new Channel3CatalogAdapter();

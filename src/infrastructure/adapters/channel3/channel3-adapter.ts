import { z } from 'zod';
import { CatalogProvider } from '@/application/ports/catalog-provider';
import { CatalogSearchQuery, CatalogSearchResult, CatalogCandidateSnapshot } from '@/domain/catalog/types';
import { getEnv } from '@/infrastructure/config/env';
import { ApiError } from '@/infrastructure/errors/api-error';
import { CurrencyCode, parseDecimalToMinorUnits } from '@/domain/money/currency';
import crypto from 'crypto';

const channel3OfferSchema = z.object({
  url: z.string(),
  domain: z.string().optional().nullable(),
  price: z
    .object({
      price: z.union([z.number(), z.string()]),
      currency: z.string().default('USD'),
      compare_at_price: z.union([z.number(), z.string()]).optional().nullable(),
    })
    .optional()
    .nullable(),
  availability: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
});

const channel3ProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  offers: z.array(channel3OfferSchema).optional().nullable(),
  merchant: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  price: z.union([z.number(), z.string()]).optional().nullable(),
  currency: z.string().optional().nullable(),
  in_stock: z.boolean().optional().nullable(),
});

const channel3SearchResponseSchema = z.union([
  z.object({
    products: z.array(channel3ProductSchema),
    next_page_token: z.string().optional().nullable(),
  }),
  z.object({
    items: z.array(channel3ProductSchema),
    total: z.number().optional().nullable(),
  }),
]);

export class Channel3CatalogAdapter implements CatalogProvider {
  readonly providerId = 'channel3' as const;

  isConfigured(): boolean {
    const env = getEnv();
    return Boolean(env.CHANNEL3_API_KEY && env.CHANNEL3_API_KEY.trim().length > 0);
  }

  async search(query: CatalogSearchQuery, purchaseRequestId: string): Promise<CatalogSearchResult> {
    if (!this.isConfigured()) {
      throw ApiError.serviceUnavailable(
        'Channel3 catalog credentials are not configured in this environment (Status: BLOCKED)',
        { provider: 'channel3', status: 'BLOCKED' }
      );
    }

    const env = getEnv();
    const endpointUrl = new URL('/v1/search', env.CHANNEL3_BASE_URL);

    const response = await fetch(endpointUrl.toString(), {
      method: 'POST',
      headers: {
        'x-api-key': env.CHANNEL3_API_KEY!,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: query.query,
        limit: query.limit || 5,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw ApiError.badGateway(`Channel3 search failed with status ${response.status}`, {
        provider: 'channel3',
        status: String(response.status),
      });
    }

    const json = await response.json();
    const parsed = channel3SearchResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw ApiError.badGateway('Channel3 response payload failed schema validation', {
        validation: parsed.error.issues.map((i) => i.message),
      });
    }

    const rawList = 'products' in parsed.data ? parsed.data.products : parsed.data.items;
    const candidates = rawList.map((item) => this.mapProductToSnapshot(item, purchaseRequestId));

    return {
      providerId: 'channel3',
      candidates,
      totalObserved: candidates.length,
    };
  }

  async getDetails(externalId: string, purchaseRequestId: string): Promise<CatalogCandidateSnapshot | null> {
    if (!this.isConfigured()) {
      throw ApiError.serviceUnavailable(
        'Channel3 catalog credentials are not configured in this environment (Status: BLOCKED)',
        { provider: 'channel3', status: 'BLOCKED' }
      );
    }

    const env = getEnv();
    const endpointUrl = new URL(`/v1/products/${encodeURIComponent(externalId)}`, env.CHANNEL3_BASE_URL);

    const response = await fetch(endpointUrl.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': env.CHANNEL3_API_KEY!,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      throw ApiError.badGateway(`Channel3 getDetails failed with status ${response.status}`, {
        provider: 'channel3',
        status: String(response.status),
      });
    }

    const json = await response.json();
    const parsed = channel3ProductSchema.safeParse(json);
    if (!parsed.success) {
      throw ApiError.badGateway('Channel3 product detail response failed schema validation');
    }

    return this.mapProductToSnapshot(parsed.data, purchaseRequestId);
  }

  private mapProductToSnapshot(
    item: z.infer<typeof channel3ProductSchema>,
    purchaseRequestId: string
  ): CatalogCandidateSnapshot {
    const primaryOffer = item.offers && item.offers.length > 0 ? item.offers[0] : null;
    const sourceUrl = primaryOffer?.url || item.url || 'https://trychannel3.com';
    const merchant = primaryOffer?.domain || item.merchant || 'Verified Retailer';

    let rawPrice = primaryOffer?.price?.price ?? item.price;
    const currencyStr = primaryOffer?.price?.currency || item.currency || 'USD';
    const curr = (currencyStr.toUpperCase() || 'USD') as CurrencyCode;

    let priceMinor: bigint | null = null;
    if (rawPrice !== undefined && rawPrice !== null) {
      try {
        priceMinor = parseDecimalToMinorUnits(String(rawPrice), curr);
      } catch {
        priceMinor = null;
      }
    }

    let availabilityStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN' = 'UNKNOWN';
    const avail = primaryOffer?.availability?.toLowerCase();
    if (avail === 'instock' || item.in_stock === true) {
      availabilityStatus = 'IN_STOCK';
    } else if (avail === 'outofstock' || item.in_stock === false) {
      availabilityStatus = 'OUT_OF_STOCK';
    }

    return {
      id: crypto.randomUUID(),
      purchaseRequestId,
      providerId: 'channel3',
      externalId: item.id,
      merchant,
      title: item.title,
      description: item.description || null,
      sourceUrl,
      priceMinor,
      currency: curr,
      availabilityStatus,
      rawMetadata: null,
      observedAt: new Date(),
    };
  }
}

export const channel3CatalogAdapter = new Channel3CatalogAdapter();

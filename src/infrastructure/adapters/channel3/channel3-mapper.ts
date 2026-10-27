import { DiscoveredProduct, DiscoveredOffer } from '@/domain/catalog/discovery-types';
import { CurrencyCode, parseDecimalToMinorUnits, formatMinorUnitsToDecimal } from '@/domain/money/currency';

/** Coerces any provider value (string, object, array) into a safe display string. */
export function toText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return toText(value[value.length - 1] ?? value[0]);
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    return toText(o.name ?? o.title ?? o.label ?? o.url);
  }
  return null;
}

function toImage(value: unknown): string | null {
  if (Array.isArray(value)) return toImage(value[0]);
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    return toText(o.url ?? o.src);
  }
  return typeof value === 'string' ? value : null;
}

export function mapChannel3ItemToProduct(item: any, idx: number): DiscoveredProduct {
  const rawOffers = Array.isArray(item.offers) ? item.offers : [];
  const offers: DiscoveredOffer[] = rawOffers.map((o: any, oIdx: number) => {
    const rawPrice = o.price?.price ?? o.price ?? 0;
    const curr = ((toText(o.price?.currency) || toText(item.currency) || 'USD').toUpperCase()) as CurrencyCode;
    let minor = 0n;
    try {
      minor = parseDecimalToMinorUnits(String(rawPrice), curr);
    } catch {
      minor = 0n;
    }
    return {
      id: `c3-off-${item.id ?? idx}-${oIdx}`,
      merchant: toText(o.domain) || toText(o.merchant) || 'Verified Merchant',
      priceMinor: minor,
      currency: curr,
      formattedPrice: `$${formatMinorUnitsToDecimal(minor, curr)}`,
      availability: String(o.availability ?? '').toLowerCase() === 'instock' ? 'IN_STOCK' : 'UNKNOWN',
      condition: toText(o.condition) || 'New',
      buyUrl: toText(o.url) || toText(item.url) || 'https://trychannel3.com',
      observedAt: new Date(),
    };
  });

  const firstPrice = offers[0]?.priceMinor ?? 0n;

  return {
    id: toText(item.id) || `c3-prod-${idx}`,
    title: toText(item.title) || 'Untitled product',
    brand: toText(item.brand ?? item.brand_name),
    category: toText(item.category ?? item.categories) || 'General',
    description: toText(item.description),
    primaryImage: toImage(item.image_url ?? item.primary_image ?? item.image ?? item.images),
    additionalImages: [],
    minPriceMinor: firstPrice,
    maxPriceMinor: firstPrice,
    currency: ((toText(item.currency) || 'USD').toUpperCase()) as CurrencyCode,
    offers,
    providerId: 'channel3' as const,
  };
}

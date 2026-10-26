import { DiscoveredProduct, DiscoveredOffer } from '@/domain/catalog/discovery-types';
import { CurrencyCode, parseDecimalToMinorUnits, formatMinorUnitsToDecimal } from '@/domain/money/currency';

export function mapChannel3ItemToProduct(item: any, idx: number): DiscoveredProduct {
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
}

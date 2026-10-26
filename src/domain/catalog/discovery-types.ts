import { CurrencyCode } from '../money/currency';

export type ProductAvailability = 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN';

export interface DiscoveredOffer {
  id: string;
  merchant: string;
  priceMinor: bigint;
  currency: CurrencyCode;
  formattedPrice: string;
  availability: ProductAvailability;
  condition: string | null;
  buyUrl: string;
  observedAt: Date;
}

export interface DiscoveredProduct {
  id: string;
  title: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  primaryImage: string | null;
  additionalImages: string[];
  minPriceMinor: bigint;
  maxPriceMinor: bigint;
  currency: CurrencyCode;
  offers: DiscoveredOffer[];
  providerId: 'channel3' | 'fixture';
}

export interface DiscoverySearchResult {
  query: string;
  category?: string | null;
  providerId: 'channel3' | 'fixture';
  isLiveChannel3: boolean;
  total: number;
  products: DiscoveredProduct[];
  error?: string | null;
}

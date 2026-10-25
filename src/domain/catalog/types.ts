import { CurrencyCode } from '../money/currency';

export type AvailabilityStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN';

export interface CatalogCandidateSnapshot {
  id: string;
  purchaseRequestId: string;
  providerId: 'channel3' | 'fixture';
  externalId: string;
  merchant: string;
  title: string;
  description?: string | null;
  sourceUrl: string;
  priceMinor: bigint | null;
  currency: CurrencyCode | null;
  availabilityStatus: AvailabilityStatus;
  rawMetadata?: Record<string, unknown> | null;
  observedAt: Date;
}

export interface CatalogSearchQuery {
  query: string;
  limit?: number;
  currency?: CurrencyCode;
  maxPriceMinor?: bigint;
}

export interface CatalogSearchResult {
  providerId: 'channel3' | 'fixture';
  candidates: CatalogCandidateSnapshot[];
  totalObserved: number;
}

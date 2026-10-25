import { CatalogSearchQuery, CatalogSearchResult, CatalogCandidateSnapshot } from '@/domain/catalog/types';

export interface CatalogProvider {
  readonly providerId: 'channel3' | 'fixture';
  isConfigured(): boolean;
  search(query: CatalogSearchQuery, purchaseRequestId: string): Promise<CatalogSearchResult>;
  getDetails(externalId: string, purchaseRequestId: string): Promise<CatalogCandidateSnapshot | null>;
}

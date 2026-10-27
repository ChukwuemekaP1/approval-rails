import { purchaseRequests, catalogCandidates } from '../db/schema';
import { PurchaseRequest, PurchaseRequestStatus } from '@/domain/purchase/types';
import { CatalogCandidateSnapshot } from '@/domain/catalog/types';
import { CurrencyCode } from '@/domain/money/currency';

export function mapRequestRow(row: typeof purchaseRequests.$inferSelect): PurchaseRequest {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    createdBy: row.createdBy,
    correlationId: row.correlationId,
    intent: row.intent,
    constraints: {
      budgetMinor: row.budgetMinor ? BigInt(row.budgetMinor) : null,
      currency: row.currency as CurrencyCode,
      category: row.category,
      preferredMerchant: row.preferredMerchant,
    },
    status: row.status as PurchaseRequestStatus,
    failureReason: row.failureReason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapCandidateRow(r: typeof catalogCandidates.$inferSelect): CatalogCandidateSnapshot {
  return {
    id: r.id,
    purchaseRequestId: r.purchaseRequestId,
    providerId: r.providerId as 'channel3' | 'fixture',
    externalId: r.externalId,
    merchant: r.merchant,
    title: r.title,
    description: r.description,
    sourceUrl: r.sourceUrl,
    priceMinor: r.priceMinor ? BigInt(r.priceMinor) : null,
    currency: (r.currency as CurrencyCode) || null,
    availabilityStatus: r.availabilityStatus as any,
    rawMetadata: r.rawMetadata ? JSON.parse(r.rawMetadata) : null,
    observedAt: r.observedAt,
  };
}

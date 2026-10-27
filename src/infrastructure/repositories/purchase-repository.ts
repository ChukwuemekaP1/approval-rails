import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../db';
import { purchaseRequests, catalogCandidates } from '../db/schema';
import { PurchaseRequest, PurchaseRequestStatus } from '@/domain/purchase/types';
import { CatalogCandidateSnapshot } from '@/domain/catalog/types';
import { ResearchSummary } from '@/domain/catalog/comparison';
import { CurrencyCode } from '@/domain/money/currency';
import { mapRequestRow, mapCandidateRow } from './purchase-mapper';

export interface CreatePurchaseRequestInput {
  workspaceId: string;
  createdBy: string;
  correlationId: string;
  intent: string;
  budgetMinor?: bigint | null;
  currency: CurrencyCode;
  category?: string | null;
  preferredMerchant?: string | null;
}

export class PurchaseRepository {
  async create(input: CreatePurchaseRequestInput): Promise<PurchaseRequest> {
    const db = getDb();
    const [row] = await db
      .insert(purchaseRequests)
      .values({
        workspaceId: input.workspaceId,
        createdBy: input.createdBy,
        correlationId: input.correlationId,
        intent: input.intent,
        budgetMinor: input.budgetMinor || null,
        currency: input.currency,
        category: input.category || null,
        preferredMerchant: input.preferredMerchant || null,
        status: 'DRAFT',
      })
      .returning();

    return mapRequestRow(row);
  }

  async getById(requestId: string, workspaceId: string): Promise<PurchaseRequest | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(purchaseRequests)
      .where(and(eq(purchaseRequests.id, requestId), eq(purchaseRequests.workspaceId, workspaceId)));

    return row ? mapRequestRow(row) : null;
  }

  async listForWorkspace(workspaceId: string): Promise<PurchaseRequest[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(purchaseRequests)
      .where(eq(purchaseRequests.workspaceId, workspaceId))
      .orderBy(desc(purchaseRequests.createdAt));

    return rows.map(mapRequestRow);
  }

  async updateStatus(
    requestId: string,
    workspaceId: string,
    status: PurchaseRequestStatus,
    failureReason?: string | null
  ): Promise<void> {
    const db = getDb();
    await db
      .update(purchaseRequests)
      .set({ status, failureReason: failureReason || null, updatedAt: new Date() })
      .where(and(eq(purchaseRequests.id, requestId), eq(purchaseRequests.workspaceId, workspaceId)));
  }

  async saveResearchResults(
    requestId: string,
    workspaceId: string,
    candidates: CatalogCandidateSnapshot[],
    summary: ResearchSummary
  ): Promise<void> {
    const db = getDb();
    await db.transaction(async (tx: any) => {
      await tx.delete(catalogCandidates).where(eq(catalogCandidates.purchaseRequestId, requestId));

      if (candidates.length > 0) {
        await tx.insert(catalogCandidates).values(
          candidates.map((c) => ({
            purchaseRequestId: requestId,
            providerId: c.providerId,
            externalId: c.externalId,
            merchant: c.merchant,
            title: c.title,
            description: c.description || null,
            sourceUrl: c.sourceUrl,
            priceMinor: c.priceMinor,
            currency: c.currency,
            availabilityStatus: c.availabilityStatus,
            rawMetadata: c.rawMetadata ? JSON.stringify(c.rawMetadata) : null,
            observedAt: c.observedAt,
          }))
        );
      }

      await tx
        .update(purchaseRequests)
        .set({
          status: 'COMPLETED',
          failureReason: null,
          summary: JSON.stringify(summary),
          updatedAt: new Date(),
        })
        .where(and(eq(purchaseRequests.id, requestId), eq(purchaseRequests.workspaceId, workspaceId)));
    });
  }

  async getCandidates(requestId: string): Promise<CatalogCandidateSnapshot[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(catalogCandidates)
      .where(eq(catalogCandidates.purchaseRequestId, requestId));

    return rows.map(mapCandidateRow);
  }

  async getSummary(requestId: string, workspaceId: string): Promise<ResearchSummary | null> {
    const db = getDb();
    const [row] = await db
      .select({ summary: purchaseRequests.summary })
      .from(purchaseRequests)
      .where(and(eq(purchaseRequests.id, requestId), eq(purchaseRequests.workspaceId, workspaceId)));

    if (!row?.summary) return null;
    try {
      return JSON.parse(row.summary);
    } catch {
      return null;
    }
  }
}

export const purchaseRepo = new PurchaseRepository();

import { purchaseRepo, CreatePurchaseRequestInput } from '@/infrastructure/repositories/purchase-repository';
import { authorizationService } from '@/application/auth/authorization-service';
import { channel3CatalogAdapter } from '@/infrastructure/adapters/channel3/channel3-adapter';
import { fixtureCatalogAdapter } from '@/infrastructure/adapters/catalog/fixture-catalog-adapter';
import { geminiResearchAdapter } from '@/infrastructure/adapters/gemini/gemini-adapter';
import { CatalogProvider } from '@/application/ports/catalog-provider';
import { PurchaseRequest, PurchaseRequestStatus } from '@/domain/purchase/types';
import { CatalogCandidateSnapshot } from '@/domain/catalog/types';
import { ResearchSummary } from '@/domain/catalog/comparison';
import { CurrencyCode, formatMinorUnitsToDecimal } from '@/domain/money/currency';
import { ApiError } from '@/infrastructure/errors/api-error';
import { baseLogger as logger } from '@/infrastructure/logging/logger';
import { getEnv } from '@/infrastructure/config/env';

export interface FormattedCandidateDTO {
  id: string;
  externalId: string;
  providerId: 'channel3' | 'fixture';
  merchant: string;
  title: string;
  description: string | null;
  sourceUrl: string;
  price: string | null;
  priceMinor: string | null;
  currency: CurrencyCode | null;
  availabilityStatus: string;
  observedAt: string;
}

export interface PurchaseRequestDTO {
  id: string;
  workspaceId: string;
  createdBy: string;
  correlationId: string;
  intent: string;
  budget: string | null;
  budgetMinor: string | null;
  currency: CurrencyCode;
  category: string | null;
  preferredMerchant: string | null;
  status: PurchaseRequestStatus;
  failureReason: string | null;
  candidates: FormattedCandidateDTO[];
  summary: ResearchSummary | null;
  createdAt: string;
  updatedAt: string;
}

export class PurchaseUseCases {
  private getCatalogProvider(override?: 'channel3' | 'fixture'): CatalogProvider {
    if (override === 'channel3') return channel3CatalogAdapter;
    if (override === 'fixture') return fixtureCatalogAdapter;

    const env = getEnv();
    if (env.CATALOG_PROVIDER === 'fixture') return fixtureCatalogAdapter;
    if (env.CATALOG_PROVIDER === 'channel3') return channel3CatalogAdapter;

    return channel3CatalogAdapter.isConfigured() ? channel3CatalogAdapter : fixtureCatalogAdapter;
  }

  async createRequest(
    principalId: string,
    workspaceId: string,
    input: {
      intent: string;
      budgetMinor?: bigint | null;
      currency?: CurrencyCode;
      category?: string | null;
      preferredMerchant?: string | null;
    },
    correlationId: string
  ): Promise<PurchaseRequestDTO> {
    await authorizationService.authorizeWorkspace(principalId, workspaceId);

    const trimmedIntent = input.intent.trim();
    if (!trimmedIntent) {
      throw ApiError.badRequest('Purchase intent cannot be empty');
    }

    const created = await purchaseRepo.create({
      workspaceId,
      createdBy: principalId,
      correlationId,
      intent: trimmedIntent,
      budgetMinor: input.budgetMinor || null,
      currency: input.currency || 'USD',
      category: input.category?.trim() || null,
      preferredMerchant: input.preferredMerchant?.trim() || null,
    });

    return this.getRequestDetails(principalId, workspaceId, created.id);
  }

  async getRequestDetails(
    principalId: string,
    workspaceId: string,
    requestId: string
  ): Promise<PurchaseRequestDTO> {
    await authorizationService.authorizeWorkspace(principalId, workspaceId);

    const request = await purchaseRepo.getById(requestId, workspaceId);
    if (!request) {
      throw ApiError.notFound('Purchase request not found');
    }

    const candidates = await purchaseRepo.getCandidates(requestId);
    const summary = await purchaseRepo.getSummary(requestId, workspaceId);

    return this.mapToDTO(request, candidates, summary);
  }

  async listRequests(principalId: string, workspaceId: string): Promise<PurchaseRequestDTO[]> {
    await authorizationService.authorizeWorkspace(principalId, workspaceId);

    const requests = await purchaseRepo.listForWorkspace(workspaceId);
    return Promise.all(
      requests.map(async (r) => {
        const candidates = await purchaseRepo.getCandidates(r.id);
        const summary = await purchaseRepo.getSummary(r.id, workspaceId);
        return this.mapToDTO(r, candidates, summary);
      })
    );
  }

  async executeResearch(
    principalId: string,
    workspaceId: string,
    requestId: string,
    providerOverride?: 'channel3' | 'fixture'
  ): Promise<PurchaseRequestDTO> {
    await authorizationService.authorizeWorkspace(principalId, workspaceId);

    const request = await purchaseRepo.getById(requestId, workspaceId);
    if (!request) {
      throw ApiError.notFound('Purchase request not found');
    }

    // Mark as RESEARCHING
    await purchaseRepo.updateStatus(requestId, workspaceId, 'RESEARCHING');

    try {
      const provider = this.getCatalogProvider(providerOverride);
      const searchResult = await provider.search(
        {
          query: request.intent,
          limit: 5,
          currency: request.constraints.currency,
          maxPriceMinor: request.constraints.budgetMinor || undefined,
        },
        requestId
      );

      // Gemini analysis
      const summary = await geminiResearchAdapter.analyzeAndCompare(
        request.intent,
        request.constraints,
        searchResult.candidates
      );

      // Save candidates and research summary
      await purchaseRepo.saveResearchResults(requestId, workspaceId, searchResult.candidates, summary);

      return await this.getRequestDetails(principalId, workspaceId, requestId);
    } catch (err: any) {
      logger.error({ err, requestId, msg: 'Purchase research workflow failed' });
      const failureReason = err instanceof Error ? err.message : 'Catalog search or AI synthesis failed';
      await purchaseRepo.updateStatus(requestId, workspaceId, 'FAILED', failureReason);
      return await this.getRequestDetails(principalId, workspaceId, requestId);
    }
  }

  private mapToDTO(
    req: PurchaseRequest,
    candidates: CatalogCandidateSnapshot[],
    summary: ResearchSummary | null
  ): PurchaseRequestDTO {
    return {
      id: req.id,
      workspaceId: req.workspaceId,
      createdBy: req.createdBy,
      correlationId: req.correlationId,
      intent: req.intent,
      budget: req.constraints.budgetMinor
        ? formatMinorUnitsToDecimal(req.constraints.budgetMinor, req.constraints.currency)
        : null,
      budgetMinor: req.constraints.budgetMinor ? req.constraints.budgetMinor.toString() : null,
      currency: req.constraints.currency,
      category: req.constraints.category || null,
      preferredMerchant: req.constraints.preferredMerchant || null,
      status: req.status,
      failureReason: req.failureReason || null,
      candidates: candidates.map((c) => ({
        id: c.id,
        externalId: c.externalId,
        providerId: c.providerId,
        merchant: c.merchant,
        title: c.title,
        description: c.description || null,
        sourceUrl: c.sourceUrl,
        price: c.priceMinor !== null && c.currency ? formatMinorUnitsToDecimal(c.priceMinor, c.currency) : null,
        priceMinor: c.priceMinor ? c.priceMinor.toString() : null,
        currency: c.currency,
        availabilityStatus: c.availabilityStatus,
        observedAt: c.observedAt.toISOString(),
      })),
      summary,
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
    };
  }
}

export const purchaseUseCases = new PurchaseUseCases();

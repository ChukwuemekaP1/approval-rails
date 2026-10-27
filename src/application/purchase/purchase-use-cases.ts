import { purchaseRepo } from '@/infrastructure/repositories/purchase-repository';
import { authorizationService } from '@/application/auth/authorization-service';
import { channel3CatalogAdapter } from '@/infrastructure/adapters/channel3/channel3-adapter';
import { fixtureCatalogAdapter } from '@/infrastructure/adapters/catalog/fixture-catalog-adapter';
import { geminiResearchAdapter } from '@/infrastructure/adapters/gemini/gemini-adapter';
import { CatalogProvider } from '@/application/ports/catalog-provider';
import { CurrencyCode } from '@/domain/money/currency';
import { ApiError } from '@/infrastructure/errors/api-error';
import { baseLogger as logger } from '@/infrastructure/logging/logger';
import { getEnv } from '@/infrastructure/config/env';
import { FormattedCandidateDTO, PurchaseRequestDTO, mapToPurchaseRequestDTO } from './purchase-dto';

export type { FormattedCandidateDTO, PurchaseRequestDTO };

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

    return mapToPurchaseRequestDTO(request, candidates, summary);
  }

  async listRequests(principalId: string, workspaceId: string): Promise<PurchaseRequestDTO[]> {
    await authorizationService.authorizeWorkspace(principalId, workspaceId);

    const requests = await purchaseRepo.listForWorkspace(workspaceId);
    return Promise.all(
      requests.map(async (r) => {
        const candidates = await purchaseRepo.getCandidates(r.id);
        const summary = await purchaseRepo.getSummary(r.id, workspaceId);
        return mapToPurchaseRequestDTO(r, candidates, summary);
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

      const summary = await geminiResearchAdapter.analyzeAndCompare(
        request.intent,
        request.constraints,
        searchResult.candidates
      );

      await purchaseRepo.saveResearchResults(requestId, workspaceId, searchResult.candidates, summary);
      return await this.getRequestDetails(principalId, workspaceId, requestId);
    } catch (err: any) {
      logger.error({ err, requestId, msg: 'Purchase research workflow failed' });
      const failureReason = err instanceof Error ? err.message : 'Catalog search or AI synthesis failed';
      await purchaseRepo.updateStatus(requestId, workspaceId, 'FAILED', failureReason);
      return await this.getRequestDetails(principalId, workspaceId, requestId);
    }
  }
}

export const purchaseUseCases = new PurchaseUseCases();

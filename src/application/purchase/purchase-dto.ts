import { PurchaseRequest, PurchaseRequestStatus } from '@/domain/purchase/types';
import { CatalogCandidateSnapshot } from '@/domain/catalog/types';
import { ResearchSummary } from '@/domain/catalog/comparison';
import { CurrencyCode, formatMinorUnitsToDecimal } from '@/domain/money/currency';

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

export function mapToPurchaseRequestDTO(
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

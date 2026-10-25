import crypto from 'crypto';
import { getDb } from '@/infrastructure/db';
import { catalogCandidates } from '@/infrastructure/db/schema';
import { basketRepo } from '@/infrastructure/repositories/basket-repository';
import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { policyRepo } from '@/infrastructure/repositories/policy-repository';
import { purchaseRepo } from '@/infrastructure/repositories/purchase-repository';
import { memberLimitsRepo } from '@/infrastructure/repositories/member-limits-repository';
import { authorizationService } from '@/application/auth/authorization-service';
import { canonicalizeProposalTerms, computeTermsHash } from '@/domain/proposal/canonicalize';
import { evaluatePolicy } from '@/domain/policy/evaluator';
import { recordLedgerEventSafe } from '@/application/ledger/record-ledger-event';
import { ApiError } from '@/infrastructure/errors/api-error';
import { CurrencyCode } from '@/domain/money/currency';
import { ProposalStatus } from '@/domain/proposal/types';

export async function procureFromBasket(workspaceId: string, principalId: string) {
  const auth = await authorizationService.authorizeWorkspace(principalId, workspaceId);
  const basketId = await basketRepo.getOrCreateBasket(workspaceId, principalId);
  const allItems = await basketRepo.listItems(basketId);
  const selected = allItems.filter((i) => i.selected);

  if (selected.length === 0) {
    throw ApiError.badRequest('No items selected for procurement.');
  }

  const memberLimits = await memberLimitsRepo.find(workspaceId, principalId);
  const currency = (selected[0].currency.toUpperCase() || 'USD') as CurrencyCode;
  let totalAmountMinor = 0n;

  for (const item of selected) {
    totalAmountMinor += item.unitPriceMinor * BigInt(item.quantity);
  }

  if (memberLimits?.maxTransactionMinor && totalAmountMinor > memberLimits.maxTransactionMinor) {
    throw ApiError.badRequest(`Request exceeds individual transaction limit.`);
  }

  const activePolicy = await policyRepo.getActivePolicy(workspaceId);
  if (!activePolicy) throw ApiError.badRequest('No active spending policy configured.');

  const evaluation = evaluatePolicy(
    activePolicy,
    {
      proposedAmount: totalAmountMinor,
      proposedCurrency: currency,
      merchantName: selected[0].merchant,
      monthlySpendToDate: 0n,
    },
    new Date()
  );

  const purchaseRequest = await purchaseRepo.create({
    workspaceId,
    createdBy: principalId,
    correlationId: crypto.randomUUID(),
    intent: `Procure ${selected.length} items from basket`,
    budgetMinor: totalAmountMinor,
    currency,
  });

  const db = getDb();
  const candidates = await Promise.all(
    selected.map(async (item) => {
      const [c] = await db
        .insert(catalogCandidates)
        .values({
          purchaseRequestId: purchaseRequest.id,
          providerId: item.providerId,
          externalId: item.productId,
          merchant: item.merchant,
          title: item.title,
          description: item.description || null,
          sourceUrl: item.sourceUrl,
          priceMinor: item.unitPriceMinor,
          currency: item.currency,
          availabilityStatus: 'IN_STOCK',
        })
        .returning();
      return c;
    })
  );

  const lineItems = selected.map((item, idx) => ({
    id: crypto.randomUUID(),
    candidateId: candidates[idx].id,
    title: item.title,
    merchant: item.merchant,
    sourceUrl: item.sourceUrl,
    quantity: item.quantity,
    unitPriceMinor: item.unitPriceMinor,
    totalPriceMinor: item.unitPriceMinor * BigInt(item.quantity),
    currency: item.currency as CurrencyCode,
  }));

  const isBusiness = auth.workspace.type === 'BUSINESS';
  let initialStatus: ProposalStatus = 'NEEDS_REVIEW';
  if (!evaluation.passed) {
    initialStatus = 'BLOCKED';
  } else if (isBusiness) {
    initialStatus = 'AWAITING_APPROVAL';
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const terms = {
    workspaceId,
    requesterId: principalId,
    sourceRequestId: purchaseRequest.id,
    merchant: selected[0].merchant,
    currency,
    items: lineItems,
    totalAmountMinor,
    policyVersion: activePolicy.version,
    policyHash: activePolicy.contentHash,
    expiresAt,
  };

  const canonicalTermsJson = canonicalizeProposalTerms(terms as any);
  const termsHash = computeTermsHash(canonicalTermsJson);

  const proposal = await proposalRepo.create(
    {
      workspaceId,
      requesterId: principalId,
      sourceRequestId: purchaseRequest.id,
      merchant: selected[0].merchant,
      currency,
      totalAmountMinor,
      status: initialStatus,
      policyVersion: activePolicy.version,
      policyHash: activePolicy.contentHash,
      policyEvaluation: evaluation,
      canonicalTermsJson,
      termsHash,
      expiresAt,
    },
    lineItems
  );

  await basketRepo.removeSelectedItems(basketId);

  await recordLedgerEventSafe({
    workspaceId,
    streamId: `purchase-${purchaseRequest.id}`,
    correlationId: purchaseRequest.correlationId,
    eventType: 'PROPOSAL_CREATED',
    actor: { kind: 'USER', id: principalId },
    payload: {
      proposalId: proposal.id,
      termsHash,
      itemCount: lineItems.length,
      totalAmountMinor: totalAmountMinor.toString(),
      currency,
    },
  });

  return { proposal, purchaseRequest, lineItemsCount: lineItems.length };
}

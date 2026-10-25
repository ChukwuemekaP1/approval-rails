import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { policyRepo } from '@/infrastructure/repositories/policy-repository';
import { purchaseRepo } from '@/infrastructure/repositories/purchase-repository';
import { authorizationService } from '@/application/auth/authorization-service';
import { buildLineItemsFromCandidates, BasketItemInput } from '@/domain/proposal/calculator';
import { canonicalizeProposalTerms, computeTermsHash } from '@/domain/proposal/canonicalize';
import { isModifiableStatus } from '@/domain/proposal/state-machine';
import { Proposal, ProposalTerms } from '@/domain/proposal/types';
import { evaluatePolicy } from '@/domain/policy/evaluator';
import { PolicyEvaluationContext } from '@/domain/policy/types';
import { recordOutboxEventSafe } from '@/application/notification/record-outbox-event';

export interface CreateProposalParams {
  workspaceId: string;
  requesterId: string;
  sourceRequestId: string;
  items: BasketItemInput[];
}

export async function createProposal(params: CreateProposalParams): Promise<Proposal> {
  const { workspaceId, requesterId, sourceRequestId, items } = params;
  await authorizationService.authorizeWorkspace(requesterId, workspaceId);

  const activePolicy = await policyRepo.getActivePolicy(workspaceId);
  if (!activePolicy) {
    throw new Error('No active policy configured for workspace');
  }

  const purchaseReq = await purchaseRepo.getById(sourceRequestId, workspaceId);
  const candidates = await purchaseRepo.getCandidates(sourceRequestId);
  const { items: lineItems, merchant, currency, totalAmountMinor } =
    buildLineItemsFromCandidates(items, candidates);

  const evalContext: PolicyEvaluationContext = {
    proposedAmount: totalAmountMinor,
    proposedCurrency: currency,
    merchantName: merchant,
    merchantCategory: purchaseReq?.constraints?.category || undefined,
    monthlySpendToDate: 0n,
  };

  const evaluation = evaluatePolicy(activePolicy, evalContext, new Date());
  const status = evaluation.passed ? 'NEEDS_REVIEW' : 'BLOCKED';
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const terms: ProposalTerms = {
    workspaceId,
    requesterId,
    sourceRequestId,
    merchant,
    currency,
    items: lineItems.map((i) => ({
      candidateId: i.candidateId,
      title: i.title,
      quantity: i.quantity,
      unitPriceMinor: i.unitPriceMinor,
      totalPriceMinor: i.totalPriceMinor,
    })),
    totalAmountMinor,
    policyVersion: activePolicy.version,
    policyHash: activePolicy.contentHash,
    expiresAt,
  };

  const canonicalTermsJson = canonicalizeProposalTerms(terms);
  const termsHash = computeTermsHash(canonicalTermsJson);

  const created = await proposalRepo.create(
    {
      workspaceId,
      requesterId,
      sourceRequestId,
      merchant,
      currency,
      totalAmountMinor,
      status,
      policyVersion: activePolicy.version,
      policyHash: activePolicy.contentHash,
      policyEvaluation: evaluation,
      canonicalTermsJson,
      termsHash,
      expiresAt,
    },
    lineItems
  );

  if (!evaluation.passed) {
    await recordOutboxEventSafe({
      workspaceId,
      eventType: 'POLICY_DENIED',
      resourceId: created.id,
      summary: `Proposal ${created.id} denied by policy: ${evaluation.reasons.join(', ')}`,
      amountMinor: totalAmountMinor.toString(),
      currency,
      merchant,
      reason: evaluation.reasons.join(', '),
    });
  }

  return created;
}

export async function reviseBasket(
  proposalId: string,
  workspaceId: string,
  principalId: string,
  items: BasketItemInput[]
): Promise<Proposal> {
  await authorizationService.authorizeWorkspace(principalId, workspaceId);
  const proposal = await proposalRepo.getById(proposalId, workspaceId);
  if (!proposal) throw new Error('Proposal not found');

  if (!isModifiableStatus(proposal.status)) {
    throw new Error(`Cannot modify proposal in status ${proposal.status}`);
  }

  const activePolicy = await policyRepo.getActivePolicy(workspaceId);
  if (!activePolicy) throw new Error('No active policy configured for workspace');

  const purchaseReq = await purchaseRepo.getById(proposal.sourceRequestId, workspaceId);
  const candidates = await purchaseRepo.getCandidates(proposal.sourceRequestId);
  const { items: lineItems, merchant, currency, totalAmountMinor } =
    buildLineItemsFromCandidates(items, candidates);

  const evalContext: PolicyEvaluationContext = {
    proposedAmount: totalAmountMinor,
    proposedCurrency: currency,
    merchantName: merchant,
    merchantCategory: purchaseReq?.constraints?.category || undefined,
    monthlySpendToDate: 0n,
  };

  const evaluation = evaluatePolicy(activePolicy, evalContext, new Date());
  const nextStatus = evaluation.passed ? 'NEEDS_REVIEW' : 'BLOCKED';

  const terms: ProposalTerms = {
    workspaceId,
    requesterId: proposal.requesterId,
    sourceRequestId: proposal.sourceRequestId,
    merchant,
    currency,
    items: lineItems.map((i) => ({
      candidateId: i.candidateId,
      title: i.title,
      quantity: i.quantity,
      unitPriceMinor: i.unitPriceMinor,
      totalPriceMinor: i.totalPriceMinor,
    })),
    totalAmountMinor,
    policyVersion: activePolicy.version,
    policyHash: activePolicy.contentHash,
    expiresAt: proposal.expiresAt,
  };

  const canonicalTermsJson = canonicalizeProposalTerms(terms);
  const termsHash = computeTermsHash(canonicalTermsJson);

  await proposalRepo.updateDraftBasket(
    proposalId,
    workspaceId,
    lineItems,
    totalAmountMinor,
    canonicalTermsJson,
    termsHash,
    evaluation,
    nextStatus
  );

  return (await proposalRepo.getById(proposalId, workspaceId))!;
}

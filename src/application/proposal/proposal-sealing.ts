import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { authorizationService } from '@/application/auth/authorization-service';
import { assertValidTransition } from '@/domain/proposal/state-machine';
import { Proposal } from '@/domain/proposal/types';
import { recordLedgerEventSafe } from '@/application/ledger/record-ledger-event';

export async function sealProposal(
  proposalId: string,
  workspaceId: string,
  principalId: string
): Promise<Proposal> {
  await authorizationService.authorizeWorkspace(principalId, workspaceId);
  const proposal = await proposalRepo.getById(proposalId, workspaceId);
  if (!proposal) throw new Error('Proposal not found');

  assertValidTransition(proposal.status, 'SEALED');
  if (!proposal.policyEvaluation.passed) {
    throw new Error('Cannot seal proposal that violates policy');
  }
  if (new Date() > proposal.expiresAt) {
    throw new Error('Proposal has expired');
  }

  await proposalRepo.updateStatus(proposalId, workspaceId, 'SEALED');
  proposal.status = 'SEALED';

  await recordLedgerEventSafe({
    workspaceId,
    streamId: proposalId,
    correlationId: proposal.sourceRequestId || proposalId,
    eventType: 'TERMS_SEALED',
    actor: { kind: 'USER', id: principalId },
    payload: {
      proposalId,
      termsHash: proposal.termsHash,
      merchant: proposal.merchant,
      amountMinor: proposal.totalAmountMinor.toString(),
      currency: proposal.currency,
    },
  });

  return proposal;
}

export async function unsealProposal(
  proposalId: string,
  workspaceId: string,
  principalId: string
): Promise<Proposal> {
  await authorizationService.authorizeWorkspace(principalId, workspaceId);
  const proposal = await proposalRepo.getById(proposalId, workspaceId);
  if (!proposal) throw new Error('Proposal not found');

  assertValidTransition(proposal.status, 'NEEDS_REVIEW');
  await proposalRepo.updateStatus(proposalId, workspaceId, 'NEEDS_REVIEW', {
    authChallenge: null,
  });
  proposal.status = 'NEEDS_REVIEW';
  proposal.authChallenge = null;
  return proposal;
}

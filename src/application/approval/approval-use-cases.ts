import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { approvalRepo } from '@/infrastructure/repositories/approval-repository';
import { authorizationService } from '@/application/auth/authorization-service';
import { recordLedgerEventSafe } from '@/application/ledger/record-ledger-event';
import { recordOutboxEventSafe } from '@/application/notification/record-outbox-event';
import { ApiError } from '@/infrastructure/errors/api-error';

export class ApprovalUseCases {
  async approveProposal(workspaceId: string, proposalId: string, approverId: string) {
    const auth = await authorizationService.authorizeWorkspace(approverId, workspaceId, 'MANAGER');
    const proposal = await proposalRepo.getById(proposalId, workspaceId);
    if (!proposal) throw ApiError.notFound('Proposal not found');

    if (proposal.status !== 'AWAITING_APPROVAL' && proposal.status !== 'SUBMITTED_FOR_APPROVAL') {
      throw ApiError.badRequest(`Cannot approve proposal in '${proposal.status}' state`);
    }

    // Enforce self-approval prevention
    if (proposal.requesterId === approverId) {
      throw ApiError.forbidden(
        'Self-approval is prohibited for business procurement. Another authorized manager must approve.'
      );
    }

    const approval = await approvalRepo.create({
      workspaceId,
      proposalId,
      approverId,
      decision: 'APPROVED',
      termsHash: proposal.termsHash,
    });

    await proposalRepo.updateStatus(proposalId, workspaceId, 'NEEDS_REVIEW');

    await recordLedgerEventSafe({
      workspaceId,
      streamId: `proposal-${proposalId}`,
      correlationId: proposal.sourceRequestId,
      eventType: 'AUTHORIZATION_VERIFIED',
      actor: {
        kind: 'SYSTEM',
        id: approverId,
      },
      payload: {
        proposalId,
        decision: 'APPROVED',
        termsHash: proposal.termsHash,
        totalAmountMinor: proposal.totalAmountMinor.toString(),
      },
    });

    return approval;
  }

  async rejectProposal(
    workspaceId: string,
    proposalId: string,
    approverId: string,
    reason?: string | null
  ) {
    await authorizationService.authorizeWorkspace(approverId, workspaceId, 'MANAGER');
    const proposal = await proposalRepo.getById(proposalId, workspaceId);
    if (!proposal) throw ApiError.notFound('Proposal not found');

    if (proposal.requesterId === approverId) {
      throw ApiError.forbidden('Self-approval controls prohibit rejecting your own request as manager.');
    }

    const rejection = await approvalRepo.create({
      workspaceId,
      proposalId,
      approverId,
      decision: 'REJECTED',
      reason: reason || 'Rejected by business manager',
      termsHash: proposal.termsHash,
    });

    await proposalRepo.updateStatus(proposalId, workspaceId, 'BLOCKED');

    await recordOutboxEventSafe({
      workspaceId,
      eventType: 'POLICY_DENIED',
      resourceId: proposalId,
      summary: `Proposal rejected by manager: ${reason || 'No reason provided'}`,
      amountMinor: proposal.totalAmountMinor.toString(),
      currency: proposal.currency,
      merchant: proposal.merchant,
      reason: reason || 'Manager rejection',
    });

    return rejection;
  }
}

export const approvalUseCases = new ApprovalUseCases();

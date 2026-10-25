import { describe, it, expect, vi, beforeEach } from 'vitest';
import { approvalUseCases } from '@/application/approval/approval-use-cases';
import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { approvalRepo } from '@/infrastructure/repositories/approval-repository';
import { authorizationService } from '@/application/auth/authorization-service';

vi.mock('@/infrastructure/repositories/proposal-repository');
vi.mock('@/infrastructure/repositories/approval-repository');
vi.mock('@/application/auth/authorization-service');
vi.mock('@/application/ledger/record-ledger-event');
vi.mock('@/application/notification/record-outbox-event');

describe('Business Manager Approval Flow & Self-Approval Prevention', () => {
  const workspaceId = 'ws-test-123';
  const requesterId = 'user-requester-1';
  const managerId = 'user-manager-2';
  const proposalId = 'prop-999';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks self-approval when requester attempts to approve their own request', async () => {
    vi.mocked(authorizationService.authorizeWorkspace).mockResolvedValue({
      workspace: { id: workspaceId, name: 'Acme', type: 'BUSINESS' } as any,
      role: 'OWNER',
    });

    vi.mocked(proposalRepo.getById).mockResolvedValue({
      id: proposalId,
      workspaceId,
      requesterId, // Requester is requesterId
      status: 'AWAITING_APPROVAL',
      termsHash: 'hash-abc',
      totalAmountMinor: 100000n,
    } as any);

    // Requester tries to approve their own request
    await expect(
      approvalUseCases.approveProposal(workspaceId, proposalId, requesterId)
    ).rejects.toThrow(/Self-approval is prohibited/);
  });

  it('allows an authorized manager to approve a valid proposal bound to exact terms hash', async () => {
    vi.mocked(authorizationService.authorizeWorkspace).mockResolvedValue({
      workspace: { id: workspaceId, name: 'Acme', type: 'BUSINESS' } as any,
      role: 'MANAGER',
    });

    vi.mocked(proposalRepo.getById).mockResolvedValue({
      id: proposalId,
      workspaceId,
      requesterId,
      status: 'AWAITING_APPROVAL',
      termsHash: 'terms-sha256-verified-123',
      totalAmountMinor: 150000n,
      sourceRequestId: 'req-src-1',
    } as any);

    vi.mocked(approvalRepo.create).mockResolvedValue({
      id: 'appr-1',
      workspaceId,
      proposalId,
      approverId: managerId,
      decision: 'APPROVED',
      reason: null,
      termsHash: 'terms-sha256-verified-123',
      createdAt: new Date(),
    });

    const result = await approvalUseCases.approveProposal(workspaceId, proposalId, managerId);

    expect(result.decision).toBe('APPROVED');
    expect(result.termsHash).toBe('terms-sha256-verified-123');
    expect(proposalRepo.updateStatus).toHaveBeenCalledWith(proposalId, workspaceId, 'NEEDS_REVIEW');
  });
});

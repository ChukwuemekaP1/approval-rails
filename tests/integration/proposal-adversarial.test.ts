import { describe, it, expect, vi } from 'vitest';
import crypto from 'crypto';
import { proposalUseCases } from '@/application/proposal/proposal-use-cases';
import { webAuthnAdapter } from '@/infrastructure/auth/webauthn-adapter';
import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { setupProposalSecurityFixture } from './proposal-fixture';

describe('Proposal Adversarial & Escalation Defenses (PostgreSQL)', () => {
  const testRunId = crypto.randomUUID().slice(0, 8);

  it('rejects authorization of an expired proposal', async () => {
    const { admin, ws, purchaseReq, candidate } = await setupProposalSecurityFixture(testRunId);

    const proposal = await proposalUseCases.createProposal({
      workspaceId: ws.id,
      requesterId: admin.id,
      sourceRequestId: purchaseReq.id,
      items: [{ candidateId: candidate.id, quantity: 1 }],
    });

    await proposalUseCases.sealProposal(proposal.id, ws.id, admin.id);

    await proposalRepo.updateStatus(proposal.id, ws.id, 'SEALED', {
      expiresAt: new Date(Date.now() - 10000),
    });

    await expect(
      proposalUseCases.generateAuthorizationOptions(proposal.id, ws.id, admin.id)
    ).rejects.toThrow(/Proposal has expired/);
  }, 30000);

  it('enforces role policy: non-admin member cannot authorize proposal requiring admin approval', async () => {
    const { member, ws, purchaseReq, candidate } = await setupProposalSecurityFixture(testRunId);

    const proposal = await proposalUseCases.createProposal({
      workspaceId: ws.id,
      requesterId: member.id,
      sourceRequestId: purchaseReq.id,
      items: [{ candidateId: candidate.id, quantity: 1 }],
    });

    expect(proposal.policyEvaluation.status).toBe('REQUIRES_ADMIN_APPROVAL');
    await proposalUseCases.sealProposal(proposal.id, ws.id, member.id);

    await expect(
      proposalUseCases.generateAuthorizationOptions(proposal.id, ws.id, member.id)
    ).rejects.toThrow(/Proposal requires ADMIN role authorization/);
  }, 30000);

  it('rejects replay of an already used authorization challenge', async () => {
    const { admin, ws, purchaseReq, candidate, passkey } = await setupProposalSecurityFixture(testRunId);

    const proposal = await proposalUseCases.createProposal({
      workspaceId: ws.id,
      requesterId: admin.id,
      sourceRequestId: purchaseReq.id,
      items: [{ candidateId: candidate.id, quantity: 1 }],
    });

    await proposalUseCases.sealProposal(proposal.id, ws.id, admin.id);
    await proposalUseCases.generateAuthorizationOptions(proposal.id, ws.id, admin.id);

    const verifySpy = vi.spyOn(webAuthnAdapter, 'verifyAuthentication').mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 1 } as any,
    });

    await proposalUseCases.authorizeProposal(proposal.id, ws.id, admin.id, {
      id: passkey.credentialId,
      rawId: passkey.credentialId,
      response: { clientDataJSON: '', authenticatorData: '', signature: '' },
      type: 'public-key',
      clientExtensionResults: {},
    });

    await expect(
      proposalUseCases.authorizeProposal(proposal.id, ws.id, admin.id, {
        id: passkey.credentialId,
        rawId: passkey.credentialId,
        response: { clientDataJSON: '', authenticatorData: '', signature: '' },
        type: 'public-key',
        clientExtensionResults: {},
      })
    ).rejects.toThrow(/Proposal must be in SEALED state to authorize/);

    verifySpy.mockRestore();
  }, 30000);
});

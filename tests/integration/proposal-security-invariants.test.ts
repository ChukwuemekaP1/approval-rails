import { describe, it, expect, vi } from 'vitest';
import crypto from 'crypto';
import { proposalUseCases } from '@/application/proposal/proposal-use-cases';
import { webAuthnAdapter } from '@/infrastructure/auth/webauthn-adapter';
import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { setupProposalSecurityFixture } from './proposal-fixture';

describe('Proposal & Mandate Security Invariants (PostgreSQL)', () => {
  const testRunId = crypto.randomUUID().slice(0, 8);

  it('rejects stale challenge after unsigned basket is revised', async () => {
    const { admin, ws, purchaseReq, candidate } = await setupProposalSecurityFixture(testRunId);

    const proposal = await proposalUseCases.createProposal({
      workspaceId: ws.id,
      requesterId: admin.id,
      sourceRequestId: purchaseReq.id,
      items: [{ candidateId: candidate.id, quantity: 1 }],
    });

    await proposalUseCases.sealProposal(proposal.id, ws.id, admin.id);

    // 1. Generate authorization options (stores authChallenge on proposal)
    const options = await proposalUseCases.generateAuthorizationOptions(proposal.id, ws.id, admin.id);
    expect(options.challenge).toBeDefined();

    // 2. Unseal and revise basket terms
    await proposalUseCases.unsealProposal(proposal.id, ws.id, admin.id);
    await proposalUseCases.reviseBasket(proposal.id, ws.id, admin.id, [
      { candidateId: candidate.id, quantity: 2 },
    ]);

    // Reseal
    await proposalUseCases.sealProposal(proposal.id, ws.id, admin.id);

    // 3. Attempting to authorize using the old challenge without generating a new one must be rejected
    await expect(
      proposalUseCases.authorizeProposal(proposal.id, ws.id, admin.id, {
        id: 'some-id',
        rawId: 'some-id',
        response: { clientDataJSON: '', authenticatorData: '', signature: '' },
        type: 'public-key',
        clientExtensionResults: {},
      })
    ).rejects.toThrow(/No active authorization challenge found on proposal/);
  }, 30000);

  it('detects and rejects terms alteration / tampering', async () => {
    const { admin, ws, purchaseReq, candidate, passkey } = await setupProposalSecurityFixture(testRunId);

    const proposal = await proposalUseCases.createProposal({
      workspaceId: ws.id,
      requesterId: admin.id,
      sourceRequestId: purchaseReq.id,
      items: [{ candidateId: candidate.id, quantity: 1 }],
    });

    await proposalUseCases.sealProposal(proposal.id, ws.id, admin.id);
    await proposalUseCases.generateAuthorizationOptions(proposal.id, ws.id, admin.id);

    // Tamper with canonical terms JSON in database directly to simulate tampering
    await proposalRepo.updateStatus(proposal.id, ws.id, 'SEALED', {
      canonicalTermsJson: proposal.canonicalTermsJson.replace('1', '9'),
    });

    const verifySpy = vi.spyOn(webAuthnAdapter, 'verifyAuthentication').mockResolvedValueOnce({
      verified: true,
      authenticationInfo: { newCounter: 1 } as any,
    });

    await expect(
      proposalUseCases.authorizeProposal(proposal.id, ws.id, admin.id, {
        id: passkey.credentialId,
        rawId: passkey.credentialId,
        response: { clientDataJSON: '', authenticatorData: '', signature: '' },
        type: 'public-key',
        clientExtensionResults: {},
      })
    ).rejects.toThrow(/Proposal terms integrity violation/);

    verifySpy.mockRestore();
  }, 30000);
});

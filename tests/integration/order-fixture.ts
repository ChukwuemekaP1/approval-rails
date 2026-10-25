import { randomUUID } from 'crypto';
import { setupProposalSecurityFixture } from './proposal-fixture';
import { proposalUseCases } from '@/application/proposal/proposal-use-cases';
import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';

export async function setupOrderTestFixture() {
  const base = await setupProposalSecurityFixture(randomUUID().slice(0, 6));

  const proposal = await proposalUseCases.createProposal({
    workspaceId: base.ws.id,
    requesterId: base.admin.id,
    sourceRequestId: base.purchaseReq.id,
    items: [{ candidateId: base.candidate.id, quantity: 1 }],
  });

  await proposalUseCases.sealProposal(proposal.id, base.ws.id, base.admin.id);

  await proposalRepo.recordAuthorization(proposal.id, base.ws.id, base.admin.id, {
    testSignature: 'fixture-passkey-authorization',
  });

  const authorizedProposal = (await proposalRepo.getById(proposal.id, base.ws.id))!;

  return {
    principal: base.admin,
    member: base.member,
    workspace: base.ws,
    purchaseRequest: base.purchaseReq,
    candidate: base.candidate,
    authorizedProposal,
  };
}

import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { authorizationService } from '@/application/auth/authorization-service';
import { Proposal } from '@/domain/proposal/types';
import { BasketItemInput } from '@/domain/proposal/calculator';
import { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { createProposal, reviseBasket, CreateProposalParams } from './proposal-creation';
import { sealProposal, unsealProposal } from './proposal-sealing';
import {
  generateAuthorizationOptions,
  authorizeProposal,
} from './proposal-authorization';

export class ProposalUseCases {
  async createProposal(params: CreateProposalParams): Promise<Proposal> {
    return createProposal(params);
  }

  async getProposal(proposalId: string, workspaceId: string, principalId: string): Promise<Proposal> {
    await authorizationService.authorizeWorkspace(principalId, workspaceId);
    const proposal = await proposalRepo.getById(proposalId, workspaceId);
    if (!proposal) throw new Error('Proposal not found');

    if (proposal.status === 'SEALED' && new Date() > proposal.expiresAt) {
      await proposalRepo.updateStatus(proposal.id, workspaceId, 'EXPIRED');
      proposal.status = 'EXPIRED';
    }

    return proposal;
  }

  async listWorkspaceProposals(workspaceId: string, principalId: string): Promise<Proposal[]> {
    await authorizationService.authorizeWorkspace(principalId, workspaceId);
    return proposalRepo.listForWorkspace(workspaceId);
  }

  async reviseBasket(
    proposalId: string,
    workspaceId: string,
    principalId: string,
    items: BasketItemInput[]
  ): Promise<Proposal> {
    return reviseBasket(proposalId, workspaceId, principalId, items);
  }

  async sealProposal(proposalId: string, workspaceId: string, principalId: string): Promise<Proposal> {
    return sealProposal(proposalId, workspaceId, principalId);
  }

  async unsealProposal(proposalId: string, workspaceId: string, principalId: string): Promise<Proposal> {
    return unsealProposal(proposalId, workspaceId, principalId);
  }

  async generateAuthorizationOptions(
    proposalId: string,
    workspaceId: string,
    principalId: string
  ) {
    return generateAuthorizationOptions(proposalId, workspaceId, principalId);
  }

  async authorizeProposal(
    proposalId: string,
    workspaceId: string,
    principalId: string,
    response: AuthenticationResponseJSON
  ): Promise<Proposal> {
    return authorizeProposal(proposalId, workspaceId, principalId, response);
  }
}

export const proposalUseCases = new ProposalUseCases();

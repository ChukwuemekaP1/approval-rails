import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../db';
import { proposals, proposalLineItems } from '../db/schema';
import { Proposal, ProposalLineItem, ProposalStatus } from '@/domain/proposal/types';
import { CurrencyCode } from '@/domain/money/currency';
import { PolicyEvaluationResult } from '@/domain/policy/types';
import { mapRowToProposal, mapLineItemRow } from './proposal-mapper';

export interface CreateProposalInput {
  workspaceId: string;
  requesterId: string;
  sourceRequestId: string;
  merchant: string;
  currency: CurrencyCode;
  totalAmountMinor: bigint;
  status: ProposalStatus;
  policyVersion: number;
  policyHash: string;
  policyEvaluation: PolicyEvaluationResult;
  canonicalTermsJson: string;
  termsHash: string;
  expiresAt: Date;
}

export class ProposalRepository {
  async create(input: CreateProposalInput, items: ProposalLineItem[]): Promise<Proposal> {
    const db = getDb();
    return await db.transaction(async (tx: any) => {
      const [row] = await tx
        .insert(proposals)
        .values({
          workspaceId: input.workspaceId,
          requesterId: input.requesterId,
          sourceRequestId: input.sourceRequestId,
          merchant: input.merchant,
          currency: input.currency,
          totalAmountMinor: input.totalAmountMinor,
          status: input.status,
          policyVersion: input.policyVersion,
          policyHash: input.policyHash,
          policyEvaluation: JSON.stringify(input.policyEvaluation),
          canonicalTermsJson: input.canonicalTermsJson,
          termsHash: input.termsHash,
          expiresAt: input.expiresAt,
        })
        .returning();

      if (items.length > 0) {
        await tx.insert(proposalLineItems).values(
          items.map((item) => ({
            id: item.id,
            proposalId: row.id,
            candidateId: item.candidateId,
            title: item.title,
            merchant: item.merchant,
            sourceUrl: item.sourceUrl,
            quantity: item.quantity,
            unitPriceMinor: item.unitPriceMinor,
            totalPriceMinor: item.totalPriceMinor,
            currency: item.currency,
          }))
        );
      }

      return mapRowToProposal(row, items);
    });
  }

  async getById(proposalId: string, workspaceId: string): Promise<Proposal | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(proposals)
      .where(and(eq(proposals.id, proposalId), eq(proposals.workspaceId, workspaceId)));

    if (!row) return null;

    const itemRows = await db
      .select()
      .from(proposalLineItems)
      .where(eq(proposalLineItems.proposalId, proposalId));

    return mapRowToProposal(row, itemRows.map(mapLineItemRow));
  }

  async listForWorkspace(workspaceId: string): Promise<Proposal[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(proposals)
      .where(eq(proposals.workspaceId, workspaceId))
      .orderBy(desc(proposals.createdAt));

    return Promise.all(
      rows.map(async (row: typeof proposals.$inferSelect) => {
        const itemRows = await db
          .select()
          .from(proposalLineItems)
          .where(eq(proposalLineItems.proposalId, row.id));

        return mapRowToProposal(row, itemRows.map(mapLineItemRow));
      })
    );
  }

  async updateStatus(
    proposalId: string,
    workspaceId: string,
    status: ProposalStatus,
    extraFields?: Partial<typeof proposals.$inferInsert>
  ): Promise<void> {
    const db = getDb();
    await db
      .update(proposals)
      .set({ status, ...extraFields, updatedAt: new Date() })
      .where(and(eq(proposals.id, proposalId), eq(proposals.workspaceId, workspaceId)));
  }

  async updateDraftBasket(
    proposalId: string,
    workspaceId: string,
    items: ProposalLineItem[],
    totalAmountMinor: bigint,
    canonicalTermsJson: string,
    termsHash: string,
    policyEvaluation: PolicyEvaluationResult,
    status: ProposalStatus
  ): Promise<void> {
    const db = getDb();
    await db.transaction(async (tx: any) => {
      await tx.delete(proposalLineItems).where(eq(proposalLineItems.proposalId, proposalId));

      if (items.length > 0) {
        await tx.insert(proposalLineItems).values(
          items.map((item) => ({
            id: item.id,
            proposalId,
            candidateId: item.candidateId,
            title: item.title,
            merchant: item.merchant,
            sourceUrl: item.sourceUrl,
            quantity: item.quantity,
            unitPriceMinor: item.unitPriceMinor,
            totalPriceMinor: item.totalPriceMinor,
            currency: item.currency,
          }))
        );
      }

      await tx
        .update(proposals)
        .set({
          totalAmountMinor,
          canonicalTermsJson,
          termsHash,
          policyEvaluation: JSON.stringify(policyEvaluation),
          status,
          authChallenge: null,
          updatedAt: new Date(),
        })
        .where(and(eq(proposals.id, proposalId), eq(proposals.workspaceId, workspaceId)));
    });
  }

  async recordAuthorization(
    proposalId: string,
    workspaceId: string,
    principalId: string,
    assertion: Record<string, unknown>
  ): Promise<void> {
    const db = getDb();
    await db
      .update(proposals)
      .set({
        status: 'AUTHORIZED',
        authorizedAt: new Date(),
        authorizedBy: principalId,
        authorizationAssertion: JSON.stringify(assertion),
        updatedAt: new Date(),
      })
      .where(and(eq(proposals.id, proposalId), eq(proposals.workspaceId, workspaceId)));
  }
}

export const proposalRepo = new ProposalRepository();

import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { approvals, principals, proposals } from '../db/schema';

export interface ApprovalRecord {
  id: string;
  workspaceId: string;
  proposalId: string;
  approverId: string;
  decision: 'APPROVED' | 'REJECTED';
  reason: string | null;
  termsHash: string;
  createdAt: Date;
}

export class ApprovalRepository {
  async create(data: {
    workspaceId: string;
    proposalId: string;
    approverId: string;
    decision: 'APPROVED' | 'REJECTED';
    reason?: string | null;
    termsHash: string;
  }): Promise<ApprovalRecord> {
    const db = getDb();
    const rows = await db
      .insert(approvals)
      .values({
        workspaceId: data.workspaceId,
        proposalId: data.proposalId,
        approverId: data.approverId,
        decision: data.decision,
        reason: data.reason || null,
        termsHash: data.termsHash,
      })
      .returning();

    return rows[0] as unknown as ApprovalRecord;
  }

  async findByProposalId(proposalId: string): Promise<ApprovalRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(approvals)
      .where(eq(approvals.proposalId, proposalId))
      .limit(1);

    return (rows[0] as unknown as ApprovalRecord) || null;
  }

  async listForWorkspace(workspaceId: string): Promise<
    Array<{
      approval: ApprovalRecord;
      approver: { id: string; displayName: string; email: string };
    }>
  > {
    const db = getDb();
    const rows = await db
      .select({
        approval: approvals,
        approver: { id: principals.id, displayName: principals.displayName, email: principals.email },
      })
      .from(approvals)
      .innerJoin(principals, eq(approvals.approverId, principals.id))
      .where(eq(approvals.workspaceId, workspaceId))
      .orderBy(approvals.createdAt);

    return rows as unknown as Array<{
      approval: ApprovalRecord;
      approver: { id: string; displayName: string; email: string };
    }>;
  }
}

export const approvalRepo = new ApprovalRepository();

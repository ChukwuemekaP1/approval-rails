import { eq, and } from 'drizzle-orm';
import { getDb } from '../db';
import { memberSpendingLimits } from '../db/schema';

export interface MemberSpendingLimit {
  id: string;
  workspaceId: string;
  principalId: string;
  monthlyBudgetMinor: bigint | null;
  maxTransactionMinor: bigint | null;
  createdAt: Date;
  updatedAt: Date;
}

export class MemberLimitsRepository {
  async find(workspaceId: string, principalId: string): Promise<MemberSpendingLimit | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(memberSpendingLimits)
      .where(
        and(
          eq(memberSpendingLimits.workspaceId, workspaceId),
          eq(memberSpendingLimits.principalId, principalId)
        )
      )
      .limit(1);

    return (rows[0] as unknown as MemberSpendingLimit) || null;
  }

  async upsert(data: {
    workspaceId: string;
    principalId: string;
    monthlyBudgetMinor?: bigint | null;
    maxTransactionMinor?: bigint | null;
  }): Promise<MemberSpendingLimit> {
    const db = getDb();
    const existing = await this.find(data.workspaceId, data.principalId);

    if (existing) {
      const rows = await db
        .update(memberSpendingLimits)
        .set({
          monthlyBudgetMinor: data.monthlyBudgetMinor !== undefined ? data.monthlyBudgetMinor : existing.monthlyBudgetMinor,
          maxTransactionMinor: data.maxTransactionMinor !== undefined ? data.maxTransactionMinor : existing.maxTransactionMinor,
          updatedAt: new Date(),
        })
        .where(eq(memberSpendingLimits.id, existing.id))
        .returning();

      return rows[0] as unknown as MemberSpendingLimit;
    }

    const rows = await db
      .insert(memberSpendingLimits)
      .values({
        workspaceId: data.workspaceId,
        principalId: data.principalId,
        monthlyBudgetMinor: data.monthlyBudgetMinor ?? null,
        maxTransactionMinor: data.maxTransactionMinor ?? null,
      })
      .returning();

    return rows[0] as unknown as MemberSpendingLimit;
  }
}

export const memberLimitsRepo = new MemberLimitsRepository();

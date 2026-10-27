import { eq, and, desc, sql } from 'drizzle-orm';
import { getDb } from '../db';
import { policies } from '../db/schema';
import { Policy, PolicyRules } from '@/domain/policy/types';
import { CurrencyCode } from '@/domain/money/currency';
import { canonicalizePolicyRules, computePolicyContentHash } from '@/domain/policy/canonicalize';
import { mapRowToPolicy } from './policy-mapper';

export interface CreatePolicyInput {
  name: string;
  currency: CurrencyCode;
  maxTransactionAmount: bigint;
  monthlyBudgetCap: bigint;
  requireAdminAbove?: bigint | null;
  allowedCategories?: string[] | null;
  blockedMerchants?: string[] | null;
}

export class PolicyRepository {
  async getActivePolicy(workspaceId: string): Promise<Policy | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(policies)
      .where(and(eq(policies.workspaceId, workspaceId), eq(policies.isActive, true)))
      .limit(1);

    if (!rows[0]) return null;
    return mapRowToPolicy(rows[0]);
  }

  async listVersions(workspaceId: string): Promise<Policy[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(policies)
      .where(eq(policies.workspaceId, workspaceId))
      .orderBy(desc(policies.version));

    return rows.map(mapRowToPolicy);
  }

  async getVersion(workspaceId: string, version: number): Promise<Policy | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(policies)
      .where(and(eq(policies.workspaceId, workspaceId), eq(policies.version, version)))
      .limit(1);

    if (!rows[0]) return null;
    return mapRowToPolicy(rows[0]);
  }

  async createAndActivate(
    workspaceId: string,
    data: CreatePolicyInput,
    creatorId: string
  ): Promise<Policy> {
    const db = getDb();

    const rules: PolicyRules = {
      currency: data.currency,
      maxTransactionAmount: data.maxTransactionAmount,
      monthlyBudgetCap: data.monthlyBudgetCap,
      requireAdminAbove: data.requireAdminAbove || null,
      allowedCategories: data.allowedCategories || null,
      blockedMerchants: data.blockedMerchants || null,
    };

    const canonicalContent = canonicalizePolicyRules(rules);
    const contentHash = computePolicyContentHash(canonicalContent);

    return await db.transaction(async (tx) => {
      const maxVerResult = await tx
        .select({ maxVer: sql<number>`COALESCE(MAX(${policies.version}), 0)` })
        .from(policies)
        .where(eq(policies.workspaceId, workspaceId));

      const nextVersion = (maxVerResult[0]?.maxVer || 0) + 1;

      await tx
        .update(policies)
        .set({ isActive: false })
        .where(and(eq(policies.workspaceId, workspaceId), eq(policies.isActive, true)));

      const insertedRows = await tx
        .insert(policies)
        .values({
          workspaceId,
          version: nextVersion,
          name: data.name.trim(),
          currency: data.currency,
          maxTransactionAmount: data.maxTransactionAmount,
          monthlyBudgetCap: data.monthlyBudgetCap,
          requireAdminAbove: data.requireAdminAbove || null,
          allowedCategories: data.allowedCategories ? JSON.stringify(data.allowedCategories) : null,
          blockedMerchants: data.blockedMerchants ? JSON.stringify(data.blockedMerchants) : null,
          canonicalContent,
          contentHash,
          isActive: true,
          createdBy: creatorId,
        })
        .returning();

      return mapRowToPolicy(insertedRows[0]);
    });
  }

  async ensureDefaultPolicy(workspaceId: string, creatorId: string): Promise<Policy> {
    const active = await this.getActivePolicy(workspaceId);
    if (active) return active;

    return await this.createAndActivate(
      workspaceId,
      {
        name: 'Default Balanced Policy (v1)',
        currency: 'USD',
        maxTransactionAmount: 50000n,
        monthlyBudgetCap: 250000n,
        requireAdminAbove: 25000n,
        blockedMerchants: ['GamblingHub', 'CryptoTokensDirect'],
        allowedCategories: null,
      },
      creatorId
    );
  }
}

export const policyRepo = new PolicyRepository();

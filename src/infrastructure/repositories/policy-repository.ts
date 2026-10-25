import { eq, and, desc, sql } from 'drizzle-orm';
import { getDb } from '../db';
import { policies } from '../db/schema';
import { Policy, PolicyRules } from '@/domain/policy/types';
import { CurrencyCode } from '@/domain/money/currency';
import {
  canonicalizePolicyRules,
  computePolicyContentHash,
} from '@/domain/policy/canonicalize';

export interface CreatePolicyInput {
  name: string;
  currency: CurrencyCode;
  maxTransactionAmount: bigint;
  monthlyBudgetCap: bigint;
  requireAdminAbove?: bigint | null;
  allowedCategories?: string[] | null;
  blockedMerchants?: string[] | null;
}

function mapRowToPolicy(row: typeof policies.$inferSelect): Policy {
  const rules: PolicyRules = {
    currency: row.currency as CurrencyCode,
    maxTransactionAmount: BigInt(row.maxTransactionAmount),
    monthlyBudgetCap: BigInt(row.monthlyBudgetCap),
    requireAdminAbove: row.requireAdminAbove ? BigInt(row.requireAdminAbove) : null,
    allowedCategories: row.allowedCategories ? JSON.parse(row.allowedCategories) : null,
    blockedMerchants: row.blockedMerchants ? JSON.parse(row.blockedMerchants) : null,
  };

  return {
    id: row.id,
    workspaceId: row.workspaceId,
    version: row.version,
    name: row.name,
    rules,
    canonicalContent: row.canonicalContent,
    contentHash: row.contentHash,
    isActive: row.isActive,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
  };
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

    // Canonicalize rules and compute hash deterministically
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
      // 1. Get current highest version for this workspace
      const maxVerResult = await tx
        .select({
          maxVer: sql<number>`COALESCE(MAX(${policies.version}), 0)`,
        })
        .from(policies)
        .where(eq(policies.workspaceId, workspaceId));

      const nextVersion = (maxVerResult[0]?.maxVer || 0) + 1;

      // 2. Deactivate any currently active policy for this workspace
      await tx
        .update(policies)
        .set({ isActive: false })
        .where(and(eq(policies.workspaceId, workspaceId), eq(policies.isActive, true)));

      // 3. Insert new active version
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

  /**
   * Seeds an authoritative default policy if none exists yet for the workspace.
   */
  async ensureDefaultPolicy(workspaceId: string, creatorId: string): Promise<Policy> {
    const active = await this.getActivePolicy(workspaceId);
    if (active) {
      return active;
    }

    return await this.createAndActivate(
      workspaceId,
      {
        name: 'Default Balanced Policy (v1)',
        currency: 'USD',
        maxTransactionAmount: 50000n, // $500.00
        monthlyBudgetCap: 250000n, // $2,500.00
        requireAdminAbove: 25000n, // $250.00
        blockedMerchants: ['GamblingHub', 'CryptoTokensDirect'],
        allowedCategories: null,
      },
      creatorId
    );
  }
}

export const policyRepo = new PolicyRepository();

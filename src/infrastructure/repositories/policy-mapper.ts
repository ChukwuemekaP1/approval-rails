import { policies } from '../db/schema';
import { Policy, PolicyRules } from '@/domain/policy/types';
import { CurrencyCode } from '@/domain/money/currency';

export function mapRowToPolicy(row: typeof policies.$inferSelect): Policy {
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

import { pgTable, uuid, varchar, text, boolean, bigint, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces, principals } from './schema-auth-tables';

export const policies = pgTable(
  'policies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    maxTransactionAmount: bigint('max_transaction_amount', { mode: 'bigint' }).notNull(),
    monthlyBudgetCap: bigint('monthly_budget_cap', { mode: 'bigint' }).notNull(),
    requireAdminAbove: bigint('require_admin_above', { mode: 'bigint' }),
    allowedCategories: text('allowed_categories'),
    blockedMerchants: text('blocked_merchants'),
    canonicalContent: text('canonical_content').notNull(),
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    isActive: boolean('is_active').default(false).notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => principals.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('policies_ws_version_idx').on(table.workspaceId, table.version)]
);

export const policiesRelations = relations(policies, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [policies.workspaceId],
    references: [workspaces.id],
  }),
  creator: one(principals, {
    fields: [policies.createdBy],
    references: [principals.id],
  }),
}));

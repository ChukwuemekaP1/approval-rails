import {
  pgTable,
  uuid,
  varchar,
  bigint,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { workspaces, principals } from './schema';

export const workspaceInvitations = pgTable(
  'workspace_invitations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 32 }).default('PURCHASER').notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    invitedBy: uuid('invited_by')
      .notNull()
      .references(() => principals.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('invitations_workspace_idx').on(table.workspaceId),
    index('invitations_token_idx').on(table.token),
  ]
);

export const memberSpendingLimits = pgTable(
  'member_spending_limits',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    principalId: uuid('principal_id')
      .notNull()
      .references(() => principals.id, { onDelete: 'cascade' }),
    monthlyBudgetMinor: bigint('monthly_budget_minor', { mode: 'bigint' }),
    maxTransactionMinor: bigint('max_transaction_minor', { mode: 'bigint' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('member_limits_ws_principal_idx').on(table.workspaceId, table.principalId),
  ]
);

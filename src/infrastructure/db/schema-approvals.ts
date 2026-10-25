import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces, principals, proposals } from './schema';

export const approvals = pgTable(
  'approvals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    proposalId: uuid('proposal_id')
      .notNull()
      .references(() => proposals.id, { onDelete: 'cascade' }),
    approverId: uuid('approver_id')
      .notNull()
      .references(() => principals.id, { onDelete: 'restrict' }),
    decision: varchar('decision', { length: 32 }).notNull(), // 'APPROVED' | 'REJECTED'
    reason: text('reason'),
    termsHash: varchar('terms_hash', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('approvals_workspace_idx').on(table.workspaceId),
    index('approvals_proposal_idx').on(table.proposalId),
  ]
);

export const approvalsRelations = relations(approvals, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [approvals.workspaceId],
    references: [workspaces.id],
  }),
  proposal: one(proposals, {
    fields: [approvals.proposalId],
    references: [proposals.id],
  }),
  approver: one(principals, {
    fields: [approvals.approverId],
    references: [principals.id],
  }),
}));

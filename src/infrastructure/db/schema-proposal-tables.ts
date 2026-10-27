import { pgTable, uuid, varchar, text, bigint, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces, principals } from './schema-auth-tables';
import { purchaseRequests, catalogCandidates } from './schema-purchase-tables';

export const proposals = pgTable('proposals', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  requesterId: uuid('requester_id')
    .notNull()
    .references(() => principals.id, { onDelete: 'restrict' }),
  sourceRequestId: uuid('source_request_id')
    .notNull()
    .references(() => purchaseRequests.id, { onDelete: 'restrict' }),
  merchant: varchar('merchant', { length: 255 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  totalAmountMinor: bigint('total_amount_minor', { mode: 'bigint' }).notNull(),
  status: varchar('status', { length: 32 }).default('DRAFT').notNull(),
  policyVersion: integer('policy_version').notNull(),
  policyHash: varchar('policy_hash', { length: 64 }).notNull(),
  policyEvaluation: text('policy_evaluation').notNull(),
  canonicalTermsJson: text('canonical_terms_json').notNull(),
  termsHash: varchar('terms_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  authorizedAt: timestamp('authorized_at', { withTimezone: true }),
  authorizedBy: uuid('authorized_by').references(() => principals.id, { onDelete: 'set null' }),
  authorizationAssertion: text('authorization_assertion'),
  authChallenge: varchar('auth_challenge', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const proposalLineItems = pgTable('proposal_line_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  proposalId: uuid('proposal_id')
    .notNull()
    .references(() => proposals.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id')
    .notNull()
    .references(() => catalogCandidates.id, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  merchant: varchar('merchant', { length: 255 }).notNull(),
  sourceUrl: text('source_url').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  unitPriceMinor: bigint('unit_price_minor', { mode: 'bigint' }).notNull(),
  totalPriceMinor: bigint('total_price_minor', { mode: 'bigint' }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [proposals.workspaceId],
    references: [workspaces.id],
  }),
  requester: one(principals, {
    fields: [proposals.requesterId],
    references: [principals.id],
  }),
  sourceRequest: one(purchaseRequests, {
    fields: [proposals.sourceRequestId],
    references: [purchaseRequests.id],
  }),
  authorizer: one(principals, {
    fields: [proposals.authorizedBy],
    references: [principals.id],
  }),
  items: many(proposalLineItems),
}));

export const proposalLineItemsRelations = relations(proposalLineItems, ({ one }) => ({
  proposal: one(proposals, {
    fields: [proposalLineItems.proposalId],
    references: [proposals.id],
  }),
  candidate: one(catalogCandidates, {
    fields: [proposalLineItems.candidateId],
    references: [catalogCandidates.id],
  }),
}));

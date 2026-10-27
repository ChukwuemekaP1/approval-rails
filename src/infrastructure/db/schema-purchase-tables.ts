import { pgTable, uuid, varchar, text, bigint, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces, principals } from './schema-auth-tables';

export const purchaseRequests = pgTable('purchase_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => principals.id, { onDelete: 'restrict' }),
  correlationId: varchar('correlation_id', { length: 64 }).notNull(),
  intent: text('intent').notNull(),
  budgetMinor: bigint('budget_minor', { mode: 'bigint' }),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  category: varchar('category', { length: 100 }),
  preferredMerchant: varchar('preferred_merchant', { length: 100 }),
  status: varchar('status', { length: 32 }).default('DRAFT').notNull(),
  failureReason: text('failure_reason'),
  summary: text('summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const catalogCandidates = pgTable('catalog_candidates', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseRequestId: uuid('purchase_request_id')
    .notNull()
    .references(() => purchaseRequests.id, { onDelete: 'cascade' }),
  providerId: varchar('provider_id', { length: 32 }).notNull(),
  externalId: varchar('external_id', { length: 255 }).notNull(),
  merchant: varchar('merchant', { length: 255 }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  sourceUrl: text('source_url').notNull(),
  priceMinor: bigint('price_minor', { mode: 'bigint' }),
  currency: varchar('currency', { length: 10 }),
  availabilityStatus: varchar('availability_status', { length: 32 }).default('UNKNOWN').notNull(),
  rawMetadata: text('raw_metadata'),
  observedAt: timestamp('observed_at', { withTimezone: true }).defaultNow().notNull(),
});

export const purchaseRequestsRelations = relations(purchaseRequests, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [purchaseRequests.workspaceId],
    references: [workspaces.id],
  }),
  creator: one(principals, {
    fields: [purchaseRequests.createdBy],
    references: [principals.id],
  }),
  candidates: many(catalogCandidates),
}));

export const catalogCandidatesRelations = relations(catalogCandidates, ({ one }) => ({
  purchaseRequest: one(purchaseRequests, {
    fields: [catalogCandidates.purchaseRequestId],
    references: [purchaseRequests.id],
  }),
}));

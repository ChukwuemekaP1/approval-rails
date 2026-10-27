import { pgTable, uuid, varchar, text, boolean, bigint, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces, principals } from './schema-auth-tables';
import { proposals } from './schema-proposal-tables';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  principalId: uuid('principal_id')
    .notNull()
    .references(() => principals.id, { onDelete: 'restrict' }),
  proposalId: uuid('proposal_id')
    .notNull()
    .unique()
    .references(() => proposals.id, { onDelete: 'restrict' }),
  paypalOrderId: varchar('paypal_order_id', { length: 128 }).notNull().unique(),
  status: varchar('status', { length: 32 }).default('CREATED').notNull(),
  intent: varchar('intent', { length: 16 }).default('CAPTURE').notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  amountMinor: bigint('amount_minor', { mode: 'bigint' }).notNull(),
  merchant: varchar('merchant', { length: 255 }).notNull(),
  idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull().unique(),
  approvalUrl: text('approval_url'),
  captureId: varchar('capture_id', { length: 128 }),
  capturedAt: timestamp('captured_at', { withTimezone: true }),
  failureReason: text('failure_reason'),
  reconciledAt: timestamp('reconciled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: varchar('event_id', { length: 128 }).notNull().unique(),
  eventType: varchar('event_type', { length: 128 }).notNull(),
  resourceType: varchar('resource_type', { length: 64 }).notNull(),
  summary: text('summary'),
  rawPayload: text('raw_payload').notNull(),
  processed: boolean('processed').default(false).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [orders.workspaceId],
    references: [workspaces.id],
  }),
  principal: one(principals, {
    fields: [orders.principalId],
    references: [principals.id],
  }),
  proposal: one(proposals, {
    fields: [orders.proposalId],
    references: [proposals.id],
  }),
}));

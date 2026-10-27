import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './schema-auth-tables';

export const workspaceNotificationSettings = pgTable('workspace_notification_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .unique()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  zapierWebhookUrl: text('zapier_webhook_url'),
  enabled: boolean('enabled').default(true).notNull(),
  notifyProposalReady: boolean('notify_proposal_ready').default(true).notNull(),
  notifyPolicyDenied: boolean('notify_policy_denied').default(true).notNull(),
  notifyPaymentCompleted: boolean('notify_payment_completed').default(true).notNull(),
  notifyPaymentFailed: boolean('notify_payment_failed').default(true).notNull(),
  notifyReconciliation: boolean('notify_reconciliation').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const workspaceNotificationSettingsRelations = relations(
  workspaceNotificationSettings,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceNotificationSettings.workspaceId],
      references: [workspaces.id],
    }),
  })
);

export const notificationOutbox = pgTable(
  'notification_outbox',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    eventType: varchar('event_type', { length: 64 }).notNull(),
    payload: jsonb('payload').notNull(),
    status: varchar('status', { length: 32 }).default('PENDING').notNull(),
    attempts: integer('attempts').default(0).notNull(),
    maxAttempts: integer('max_attempts').default(5).notNull(),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }).defaultNow().notNull(),
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
    lastHttpStatus: integer('last_http_status'),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('outbox_status_next_attempt_idx').on(table.status, table.nextAttemptAt),
    index('outbox_workspace_created_idx').on(table.workspaceId, table.createdAt),
  ]
);

export const notificationOutboxRelations = relations(notificationOutbox, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [notificationOutbox.workspaceId],
    references: [workspaces.id],
  }),
}));

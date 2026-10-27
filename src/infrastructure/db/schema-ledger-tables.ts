import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './schema-auth-tables';

export const ledgerEntries = pgTable(
  'ledger_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    streamId: text('stream_id').notNull(),
    correlationId: text('correlation_id').notNull(),
    sequence: integer('sequence').notNull(),
    eventType: varchar('event_type', { length: 64 }).notNull(),
    actorKind: varchar('actor_kind', { length: 32 }).notNull(),
    actorId: varchar('actor_id', { length: 255 }).notNull(),
    actorName: varchar('actor_name', { length: 255 }),
    payload: jsonb('payload').notNull(),
    prevHash: varchar('prev_hash', { length: 64 }).notNull(),
    hash: varchar('hash', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('stream_sequence_idx').on(table.streamId, table.sequence),
    index('ledger_workspace_idx').on(table.workspaceId, table.createdAt),
    index('ledger_correlation_idx').on(table.correlationId),
  ]
);

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [ledgerEntries.workspaceId],
    references: [workspaces.id],
  }),
}));

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  bigint,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Principals ---
export const principals = pgTable('principals', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Passkeys ---
export const passkeys = pgTable('passkeys', {
  id: uuid('id').defaultRandom().primaryKey(),
  principalId: uuid('principal_id')
    .notNull()
    .references(() => principals.id, { onDelete: 'cascade' }),
  credentialId: text('credential_id').notNull().unique(),
  publicKey: text('public_key').notNull(),
  counter: bigint('counter', { mode: 'number' }).default(0).notNull(),
  deviceType: varchar('device_type', { length: 64 }).default('singleDevice').notNull(),
  backedUp: boolean('backed_up').default(false).notNull(),
  transports: text('transports'), // JSON array of AuthenticatorTransportFuture
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Workspaces ---
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 32 }).default('PERSONAL').notNull(), // 'PERSONAL' | 'BUSINESS'
  createdBy: uuid('created_by')
    .notNull()
    .references(() => principals.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Workspace Members ---
export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    principalId: uuid('principal_id')
      .notNull()
      .references(() => principals.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 32 }).default('MEMBER').notNull(), // 'ADMIN' | 'MEMBER'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('workspace_members_ws_principal_idx').on(table.workspaceId, table.principalId),
  ]
);

// --- Sessions ---
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  principalId: uuid('principal_id')
    .notNull()
    .references(() => principals.id, { onDelete: 'cascade' }),
  activeWorkspaceId: uuid('active_workspace_id').references(() => workspaces.id, {
    onDelete: 'set null',
  }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Auth Challenges ---
export const authChallenges = pgTable('auth_challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  challenge: text('challenge').notNull().unique(),
  flowType: varchar('flow_type', { length: 32 }).notNull(), // 'REGISTRATION' | 'AUTHENTICATION'
  principalId: uuid('principal_id').references(() => principals.id, { onDelete: 'set null' }),
  email: varchar('email', { length: 255 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Policies ---
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
    allowedCategories: text('allowed_categories'), // JSON array of string
    blockedMerchants: text('blocked_merchants'), // JSON array of string
    canonicalContent: text('canonical_content').notNull(),
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    isActive: boolean('is_active').default(false).notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => principals.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('policies_ws_version_idx').on(table.workspaceId, table.version),
  ]
);

// --- Relations ---
export const principalsRelations = relations(principals, ({ many }) => ({
  passkeys: many(passkeys),
  workspaceMemberships: many(workspaceMembers),
  createdWorkspaces: many(workspaces),
  sessions: many(sessions),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  creator: one(principals, {
    fields: [workspaces.createdBy],
    references: [principals.id],
  }),
  members: many(workspaceMembers),
  policies: many(policies),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  principal: one(principals, {
    fields: [workspaceMembers.principalId],
    references: [principals.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  principal: one(principals, {
    fields: [sessions.principalId],
    references: [principals.id],
  }),
  activeWorkspace: one(workspaces, {
    fields: [sessions.activeWorkspaceId],
    references: [workspaces.id],
  }),
}));

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

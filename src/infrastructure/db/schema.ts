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
  passwordHash: text('password_hash'),
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

// --- Purchase Requests ---
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
  summary: text('summary'), // JSON-serialized ResearchSummary
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Catalog Candidates ---
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

// --- Proposals / Mandates ---
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
  policyEvaluation: text('policy_evaluation').notNull(), // JSON
  canonicalTermsJson: text('canonical_terms_json').notNull(),
  termsHash: varchar('terms_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  authorizedAt: timestamp('authorized_at', { withTimezone: true }),
  authorizedBy: uuid('authorized_by').references(() => principals.id, { onDelete: 'set null' }),
  authorizationAssertion: text('authorization_assertion'), // JSON
  authChallenge: varchar('auth_challenge', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Proposal Line Items ---
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

// --- Orders (Phase 6) ---
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

// --- Webhook Events (Phase 6) ---
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

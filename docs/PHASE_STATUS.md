# ApproveRail Phase Status

## Phase 1: Foundation, Application Shell, and Operational Baselines
**Status**: Completed
- Greenfield Next.js App Router modular monolith initialized.
- Inward-pointing source boundaries defined (`src/domain`, `src/application`, `src/infrastructure`, `src/app`, `src/ui`).
- Server-only validated configuration with Zod.
- Structured logger with secret redaction.
- RFC 9457 Problem Details error handler.
- Liveness probe `GET /api/v1/health` and database readiness probe `GET /api/v1/readiness`.
- Responsive application shell with desktop sidebar & 5-destination mobile bottom navigation (360px viewport tested).

---

## Phase 2: Tenancy, Principals, and Passkey Authentication (Completed)
**Status**: Completed

### Scope & Deliverables
- [x] **PostgreSQL / Neon Migration**:
  - Drizzle schema (`src/infrastructure/db/schema.ts`) and forward-only migration applied:
    - `principals`: authenticated identity and metadata.
    - `passkeys`: WebAuthn credential metadata and public keys (authenticator private keys are NEVER stored).
    - `workspaces`: personal and business organization multi-tenancy.
    - `workspace_members`: composite unique constraint on `(workspace_id, principal_id)` preventing duplicate membership.
    - `sessions`: revocable sessions with explicit expiry, user agent, IP tracking.
    - `auth_challenges`: server-generated, single-use, expiring challenges bound to flow type.
- [x] **WebAuthn Passkey Registration & Authentication**:
  - Maintained SimpleWebAuthn adapter (`@simplewebauthn/server` and `@simplewebauthn/browser`).
  - Endpoints:
    - `POST /api/v1/auth/passkey/register-options`
    - `POST /api/v1/auth/passkey/register-verify`
    - `POST /api/v1/auth/passkey/auth-options`
    - `POST /api/v1/auth/passkey/auth-verify`
    - `GET /api/v1/auth/session`
    - `POST /api/v1/auth/logout`
  - Invariant enforcement: Server verifies assertions; never trusts client-supplied principal ID or workspace role.
  - Secure session cookie flags: `HttpOnly: true`, `SameSite: lax`, `Path: '/'`, `MaxAge: 7 days`, `Secure: in production`.
- [x] **Workspace Tenancy & Selection**:
  - `GET /api/v1/workspaces`: lists authorized workspaces for caller.
  - `POST /api/v1/workspaces`: creates workspace; creator automatically assigned `ADMIN` via server logic.
  - `PUT /api/v1/workspaces/select`: verifies membership before switching active workspace.
  - `GET /api/v1/workspaces/:workspaceId/members`: verifies caller membership before returning roster.
- [x] **Shared Authorization Service**:
  - `src/application/auth/authorization-service.ts`:
    - Checks: (a) authenticated principal, (b) workspace membership, (c) role (ADMIN vs MEMBER), (d) resource ownership.
    - Proves User B cannot access User A's workspace or resources by tampering with IDs.
- [x] **Rate Limiting**:
  - InMemory sliding window limiter on public challenge endpoints (`/api/v1/auth/passkey/auth-options`, `register-options`).
- [x] **UI & App Shell Integration**:
  - Interactive `/auth` with WebAuthn browser passkey creation and assertion.
  - `AuthProvider` context managing active session and workspace state.
  - Header dynamic workspace switcher and user logout.
  - `/app/workspaces` management page with create modal and member roster.
- [x] **Testing & Verification**:
  - Typecheck (`tsc --noEmit`): PASS (0 errors).
  - Lint (`next lint`): PASS (0 errors, 0 warnings).
  - Unit & UI tests (`vitest run`): 10 test files, 31 tests passed.
  - Database Integration tests: verified multi-tenant isolation, unique constraints, and challenge single-use semantics against live Neon PostgreSQL.
  - Playwright E2E tests: 10 tests passed across desktop and mobile 360px viewports.

---

## Roadmap & Next Gates

## Phase 3: Policy Versioning & Deterministic Evaluation (Completed)
**Status**: Completed

### Scope & Deliverables
- [x] **Zero Floating-Point Money Domain (`src/domain/money/currency.ts`)**:
  - `CurrencyCode`, `SUPPORTED_CURRENCIES` (USD, EUR, GBP, CAD, AUD, JPY).
  - Minor unit precision (`bigint`) for all financial amounts.
  - Pure functions: `parseDecimalToMinorUnits`, `formatMinorUnitsToDecimal`, `compareMoney`, `addMoney`, `subtractMoney`.
  - Rejection of floating point and strict handling of 0-decimal currencies (JPY).
- [x] **Deterministic Policy Engine (`src/domain/policy/`)**:
  - Pure domain types (`Policy`, `PolicyRules`, `PolicyEvaluationContext`, `PolicyEvaluationResult`).
  - Stable reason codes (`POLICY_OK`, `CURRENCY_MISMATCH`, `EXCEEDS_TRANSACTION_CAP`, `EXCEEDS_MONTHLY_BUDGET`, `REQUIRES_ADMIN_AUTHORIZATION`, `MERCHANT_BLOCKED`, `CATEGORY_DISALLOWED`).
  - Pure evaluator (`evaluatePolicy`) free of framework dependencies, hidden clock reads, or network I/O.
  - Canonicalization & Hashing (`canonicalizePolicyRules`, `computePolicyContentHash`): key-sorted JSON and SHA-256 digest.
- [x] **PostgreSQL Database Schema & Migration**:
  - `policies` table in `src/infrastructure/db/schema.ts` with composite unique constraint `(workspace_id, version)` and foreign keys to `workspaces` and `principals`.
  - Forward-only Drizzle migration `drizzle/0001_useful_mariko_yashida.sql` applied to live Neon database.
- [x] **Policy Repository & Use Cases**:
  - `policyRepo.getActivePolicy`, `listVersions`, `getVersion`, `createAndActivate`, `ensureDefaultPolicy`.
  - Atomic transaction: deactivates previous active policy and persists version $N+1$.
  - Documented default policy seeded upon initial query for new workspaces.
  - `PolicyUseCases`:
    - `getActivePolicy`: retrieves active policy.
    - `listVersions`: retrieves full immutable version history.
    - `createAndActivateVersion`: strictly gated by workspace `ADMIN` authorization.
    - `evaluateProposal`: resolves authoritative policy directly from database; client-supplied policies are prohibited.
- [x] **API Endpoints**:
  - `GET /api/v1/workspaces/:workspaceId/policy`
  - `POST /api/v1/workspaces/:workspaceId/policy`
  - `GET /api/v1/workspaces/:workspaceId/policy/versions`
- [x] **UI & App Shell Integration (`/app/policies`)**:
  - Active policy overview with real-time rule cards and canonical SHA-256 content hash inspection.
  - Role-aware editor (`ADMIN` authoring vs `MEMBER` read-only indicator).
  - Live client-side validation (per-transaction cap $\le$ monthly budget cap, positive numbers).
  - Dirty state tracking ("Unsaved Changes (Draft)").
  - Immutable version history timeline with rule inspection modal.
  - Invariant callout: sealed proposals retain their evaluated policy version and hash.
- [x] **Testing & Verification**:
  - Unit tests: `tests/unit/money.test.ts` (13 tests), `tests/unit/policy-canonicalize.test.ts` (3 tests), `tests/unit/policy-evaluator.test.ts` (7 tests).
  - Integration tests: `tests/integration/policy-versioning.test.ts` (4 tests) against live Neon PostgreSQL.
  - UI tests: `tests/ui/policies-page.test.tsx` (3 tests).
  - Playwright E2E tests: 10 tests passed across desktop and mobile 360px viewports.
  - Full suite: 14 test files, 58 tests passed.
  - Typecheck (`tsc --noEmit`): 0 errors.
  - Lint (`next lint`): 0 errors, 0 warnings.
  - Production build (`next build`): SUCCESS.

---

## Phase 4: Purchase Discovery & AI Research Assistance (Completed)
**Status**: Completed

### Scope & Deliverables
- [x] **Purchase Request & Catalog Domain**:
  - `src/domain/purchase/types.ts`: `PurchaseRequest`, `PurchaseRequestStatus` (`DRAFT`, `RESEARCHING`, `COMPLETED`, `FAILED`), `PurchaseConstraints`.
  - `src/domain/catalog/types.ts`: `CatalogCandidateSnapshot`, `CatalogSearchQuery`, `CatalogSearchResult`.
  - `src/domain/catalog/comparison.ts`: `ResearchSummary`, `CandidateComparison`.
- [x] **PostgreSQL Schema & Migration**:
  - Tables `purchase_requests` and `catalog_candidates` added to `src/infrastructure/db/schema.ts` with workspace scoping, cascade deletes, and foreign keys.
  - Forward-only migration `drizzle/0002_tired_madrox.sql` applied to live Neon database.
- [x] **Catalog Provider Port & Adapters**:
  - `CatalogProvider` port interface.
  - `Channel3CatalogAdapter`: real HTTP client for Channel3 API (`POST /v1/search`), validates request/response schemas with Zod, normalizes errors, converts prices to integer minor units, and reports `BLOCKED` status when credentials unconfigured.
  - `FixtureCatalogAdapter`: deterministic test fixtures for unit and integration testing without fabricating fake live results.
  - Server-only execution: API keys never leave server boundary.
- [x] **Gemini Research & Comparison Adapter**:
  - `GeminiResearchAdapter`: `@google/genai` integration with model `gemini-3.8-flash`.
  - Strictly constrained discovery and comparison scope. No access to PayPal, order capture, payment authorization, or policy editing tools.
  - Treats user prompt and catalog descriptions as untrusted data (prompt-injection defense).
  - Validates structured output via Zod.
  - Enforces safety invariant: `recommendedCandidateId` restricted strictly to verified candidate list.
  - Never overrides catalog facts, prices, or URLs.
- [x] **Application Use Cases & APIs**:
  - `PurchaseUseCases`: `createRequest`, `getRequestDetails`, `listRequests`, `executeResearch`.
  - `POST /api/v1/workspaces/:workspaceId/purchases`: creates request (and optional auto-research).
  - `GET /api/v1/workspaces/:workspaceId/purchases`: lists requests.
  - `GET /api/v1/workspaces/:workspaceId/purchases/:requestId`: gets request details and candidates.
  - `POST /api/v1/workspaces/:workspaceId/purchases/:requestId/research`: runs/retries research workflow.
- [x] **UI Pages**:
  - `/app/purchases/new`: Natural language intent, target budget in integer minor units, currency, category, preferred merchant.
  - `/app/purchases/[requestId]`: Persistent detail view with status badge, AI synthesis, recommendation highlight, catalog candidate cards, stock availability, and source links.
  - Durable persistence: page refresh never erases completed research.
  - Mobile (360px) and desktop responsive.
- [x] **Testing & Verification**:
  - Unit tests: `channel3-adapter.test.ts` (4 tests), `gemini-adapter.test.ts` (3 tests).
  - Integration tests: `purchase-request.test.ts` (2 tests) against live Neon PostgreSQL.
  - UI tests: `purchases-pages.test.tsx` (2 tests).
  - Full suite: 19 test files, 72 tests passed.
  - Playwright E2E tests: 10 tests passed across desktop and 360px mobile viewports.
  - Typecheck (`tsc --noEmit`): 0 errors.
  - Lint (`next lint`): 0 errors, 0 warnings.
  - Production build (`next build`): SUCCESS.

---

## Roadmap & Next Gates

## Phase 5: Proposal Review, Term Sealing & Passkey Authorization (Completed)
**Status**: Completed

### Scope & Deliverables
- [x] **Proposal & Mandate Domain**:
  - `src/domain/proposal/types.ts`: `ProposalStatus`, `ProposalLineItem`, `ProposalTerms`, `Proposal`.
  - `src/domain/proposal/canonicalize.ts`: RFC 8785 deterministic JCS canonicalization with key sorting, BigInt minor unit base-10 string serialization, and SHA-256 terms digest (`computeTermsHash`).
  - `src/domain/proposal/state-machine.ts`: Legal state transitions (`canTransition`, `assertValidTransition`, `isModifiableStatus`, `isSealedStatus`, `isTerminalStatus`).
  - `src/domain/proposal/calculator.ts`: Server-side price calculation enforcing single merchant, single currency, integer minor units arithmetic, and confirmed pricing snapshots.
- [x] **PostgreSQL Schema & Migration**:
  - Added `proposals` and `proposal_line_items` tables with cascade deletes, timestamps, and indexes.
  - Forward-only migration `drizzle/0003_third_mimic.sql` applied to live Neon database.
- [x] **Application Use Cases & APIs**:
  - `ProposalUseCases`: `createProposal`, `getProposal`, `listWorkspaceProposals`, `reviseBasket`, `sealProposal`, `unsealProposal`, `generateAuthorizationOptions`, `authorizeProposal`.
  - API routes:
    - `GET/POST /api/v1/workspaces/[workspaceId]/proposals`
    - `GET /api/v1/workspaces/[workspaceId]/proposals/[proposalId]`
    - `PUT /api/v1/workspaces/[workspaceId]/proposals/[proposalId]/basket`
    - `POST /api/v1/workspaces/[workspaceId]/proposals/[proposalId]/seal`
    - `POST /api/v1/workspaces/[workspaceId]/proposals/[proposalId]/unseal`
    - `POST /api/v1/workspaces/[workspaceId]/proposals/[proposalId]/auth-options`
    - `POST /api/v1/workspaces/[workspaceId]/proposals/[proposalId]/authorize`
- [x] **UI Review & Authorization Surface**:
  - `/app/proposals/[proposalId]`: Status badges, policy compliance card, editable basket with quantity adjusters, canonical RFC 8785 SHA-256 digest viewer, seal/unseal controls, and WebAuthn passkey assertion trigger via `@simplewebauthn/browser`.
  - Added "Create Proposal" trigger on candidate cards in `/app/purchases/[requestId]`.
- [x] **Testing & Verification**:
  - Unit tests: `proposal-canonicalize.test.ts` (3 tests), `proposal-state-machine.test.ts` (4 tests), `proposal-calculator.test.ts` (4 tests).
  - Integration tests: `proposal-lifecycle.test.ts` (2 tests) against live Neon PostgreSQL database.
  - UI tests: `proposal-page.test.tsx` (2 tests).
  - Full suite: 24 test files, 87 tests passed.
  - Playwright E2E: 10 tests passed on desktop and mobile viewports.
  - Typecheck: 0 errors.
  - Lint: 0 errors.
  - Production build: SUCCESS.

---

## Phase 6: PayPal Settlement & Idempotent Capture (Completed)
**Status**: Completed

### Scope & Deliverables
- [x] **Server-Only PayPal Orders v2 Adapter**:
  - Implemented `PaymentGatewayPort` behind application port with `PayPalClient` and `PayPalAdapter`.
  - Full sandbox support with token caching, timeout guards, and strict secret redaction.
  - Mocks and fixtures for deterministic offline testing.
- [x] **Mandate Authorization Checks & Immutability**:
  - Enforced SEC-01: Only proposal requester or workspace ADMIN can create an order.
  - Enforced SEC-02: Only order owner or workspace ADMIN can capture an order.
  - Amount, currency, and merchant are derived strictly from the persisted, authorized proposal (request body tampering is impossible).
  - Database unique constraint on `orders.proposal_id` prevents duplicate order creation.
- [x] **Explicit Payment State Machine & Reconciliation**:
  - States: `CREATED`, `APPROVAL_PENDING`, `CAPTURE_PENDING`, `COMPLETED`, `FAILED`, `UNKNOWN`.
  - Outbound capture timeouts safely transition order state to `UNKNOWN` (never falsely marked success).
  - `ReconcileOrderUseCase` checks PayPal authoritative state before resolving ambiguous payments.
  - Transactional locking prevents double capture races.
- [x] **PayPal Webhook Verification & Deduplication**:
  - `POST /api/v1/paypal/webhooks`: Verified signature using provider mechanism and `PAYPAL_WEBHOOK_ID`.
  - Stored verified events under unique constraint `webhook_events.event_id` for idempotent processing.
  - Documented retryable 503 response if webhook configuration is absent in production.
- [x] **UI & User Experience**:
  - `/app/orders/[orderId]`: Authoritative order review, PayPal sandbox checkout link, capture trigger, and reconciliation actions.
  - `/app/transactions`: Real workspace transaction activity with status badges and links to settlement details.
  - Handoff from `/app/proposals/[proposalId]` directly into PayPal order creation when mandate is authorized.
- [x] **Testing & Verification**:
  - Unit tests: `payment-state-machine.test.ts`, `paypal-adapter.test.ts`.
  - Integration tests: `order-lifecycle.test.ts`, `order-security-invariants.test.ts`.
  - UI tests: `order-page.test.tsx`.
  - Full test suite: 31 test files / 107 tests passed (Vitest).
  - Playwright E2E: 18 tests passed across Desktop and 360px mobile viewports.

---

## Roadmap & Next Gates

### Phase 7: Operational Ledger, Evidence Trail & Verification (Completed)
**Status**: Completed

### Scope & Deliverables
- [x] **Append-Only Ledger Domain & Cryptographic Hash Chaining**:
  - `src/domain/ledger/types.ts`: `LedgerEventType`, `LedgerActor`, `LedgerEntry`, `EvidenceBundle`, `VerificationResult`.
  - `src/domain/ledger/canonicalize.ts`: RFC 8785 deterministic JSON Canonicalization Scheme (JCS) with lexicographical key sorting, standard genesis anchor (`0000000000000000000000000000000000000000000000000000000000000000`), and SHA-256 hex digest computation via `globalThis.crypto.subtle`.
  - `src/domain/ledger/redaction.ts`: `sanitizePayload` preventing secrets, passwords, PINs, tokens, and passkey challenges from persisting into event payloads.
  - `src/domain/ledger/verifier.ts`: Pure offline `verifyEvidenceBundle` checking schema version, genesis anchor, sequence gaps, cryptographic predecessor links (`prevHash === prev.hash`), payload integrity, and head hash matching.
- [x] **PostgreSQL Schema, Immutability Trigger & Advisory Locks**:
  - Added `ledger_entries` table in `src/infrastructure/db/schema.ts` with columns (`id`, `workspace_id`, `stream_id`, `correlation_id`, `sequence`, `event_type`, `actor_kind`, `actor_id`, `actor_name`, `payload`, `prev_hash`, `hash`, `created_at`) and composite unique index on `(stream_id, sequence)`.
  - Forward-only migration `drizzle/0006_careful_otto_octavius.sql` executed against live Neon PostgreSQL database.
  - Database-level immutability enforcement: PostgreSQL function `prevent_ledger_mutation()` and trigger `trg_ledger_entries_immutable` preventing any `UPDATE` or `DELETE` at the database engine level.
  - Concurrency serialization: per-stream PostgreSQL advisory transaction lock (`SELECT pg_advisory_xact_lock(hashtext(streamId))`) preventing race conditions during concurrent monotonic appends.
- [x] **Lifecycle Event Recording**:
  - Emitted tamper-evident ledger events across all critical workflows:
    - `REQUEST_CREATED`, `RESEARCH_COMPLETED`, `PROPOSAL_CREATED`, `TERMS_SEALED`, `AUTHORIZATION_VERIFIED`, `ORDER_CREATED`, `CAPTURE_REQUESTED`, `CAPTURE_COMPLETED`, `CAPTURE_UNKNOWN`, `CAPTURE_FAILED`, `WEBHOOK_PROCESSED`, `RECONCILIATION_COMPLETED`.
- [x] **API Endpoints**:
  - `GET /api/v1/workspaces/[workspaceId]/ledger`: Paginated, filterable operational ledger listing.
  - `GET /api/v1/workspaces/[workspaceId]/ledger/export`: Standalone evidence bundle JSON export.
  - `POST /api/v1/verify`: Stateless offline cryptographic verification endpoint.
  - `GET /api/v1/workspaces/[workspaceId]/transactions`: Filterable transaction list.
  - `GET /api/v1/workspaces/[workspaceId]/transactions/[transactionId]`: Complete transaction details with proposal snapshot and full ledger stream.
- [x] **Operational UI Pages**:
  - `/app/transactions`: Workspace transaction activity list with status indicators and direct links.
  - `/app/transactions/[transactionId]`: Transaction receipt, order details, timeline, and one-click "Export Evidence (.json)" action.
  - `/app/ledger`: Role/workspace-protected operational ledger with Table view and Timeline view toggles, event filters, and direct links to verify.
  - `/app/verify`: Independent client-side verifier accepting file drag-and-drop or pasted JSON with step-by-step cryptographic audit results and tamper reason codes.
- [x] **Testing & Verification**:
  - Unit tests: `tests/unit/ledger-domain.test.ts` (4 tests).
  - Integration tests: `tests/integration/ledger-integration.test.ts` (3 tests) verifying monotonic sequence, trigger immutability rejection, and parallel append concurrency.
  - UI tests: `tests/ui/ledger-pages.test.tsx` (2 tests).
  - All test files passing against live Neon PostgreSQL database.
  - Typecheck (`tsc --noEmit`): 0 errors.
  - Production build (`next build`): 17/17 pages static and dynamic routes compiled successfully.

---

## Roadmap & Next Gates

### Phase 8: Notifications, Outbox & Audit Exports (Completed)
**Status**: Completed

### Scope & Deliverables
- [x] **AG Grid Community Operational Audit Grid**:
  - Reusable `AuditLedgerGrid.tsx` (`ag-grid-community`, `ag-grid-react`) integrated into `/app/ledger`.
  - Columns: Sequence (#), Timestamp (locale formatted), Correlation ID, Event Type (color-coded badge), Actor, Amount/Currency (safely extracted from payload), Predecessor Hash, Event Hash.
  - Features: Quick search filter, column sorting, pagination (10/25/50 per page), CSV export (`gridApi.exportDataAsCsv()`), loading/empty overlays.
  - Container-constrained horizontal scrolling (`overflow-x-auto`) styled with app tokens so it never causes page-wide horizontal scroll on mobile viewports.
- [x] **Asynchronous Transactional Notification Outbox**:
  - PostgreSQL schema `notification_outbox` and `workspace_notification_settings` with migration `0007_ancient_kree.sql` applied to live Neon database.
  - Enqueues minimized, sanitized advisory events in transactions with business state changes: `PROPOSAL_READY_FOR_REVIEW`, `POLICY_DENIED`, `PAYMENT_COMPLETED`, `PAYMENT_FAILED`, `PAYMENT_RECONCILIATION_REQUIRED`, and `TEST_NOTIFICATION`.
  - Non-blocking execution ensures notification dispatch failures never cause payment capture failure or duplicate capture.
- [x] **Resilient Dispatcher & Secret Redaction**:
  - `OutboxDispatcherUseCase` dispatches minimal JSON payloads to configured Zapier webhook endpoint with 5s timeout.
  - Bounded exponential backoff: $2^n \times 1\text{s}$ capped at 60s, maximum 5 attempts.
  - Terminal classification: 2xx $\rightarrow$ `DISPATCHED`, 4xx $\rightarrow$ `DEAD_LETTER`, 5xx/network timeout $\rightarrow$ `PENDING` (retry).
  - Zapier webhook URL treated as sensitive secret: masked in UI and redacted in server logs.
- [x] **Settings & Integrations UI (`/app/settings`)**:
  - Webhook URL configuration with mask/show toggle.
  - Integration status badge ("Active & Connected", "Disabled", "Not Configured").
  - Granular event type subscription toggles.
  - "Send Test Ping" action for immediate live connectivity verification without impersonating real payment.
  - Outbox delivery log & audit trail table displaying event type, status, HTTP code, retry count, and timestamp.
- [x] **API Endpoints**:
  - `GET /api/v1/workspaces/[workspaceId]/notifications/settings`
  - `PUT /api/v1/workspaces/[workspaceId]/notifications/settings`
  - `GET /api/v1/workspaces/[workspaceId]/notifications/history`
  - `POST /api/v1/workspaces/[workspaceId]/notifications/test`
  - `POST /api/v1/workspaces/[workspaceId]/notifications/dispatch`
- [x] **Testing & Verification**:
  - Unit tests: `tests/unit/notification-domain.test.ts` (5 tests).
  - Integration tests: `tests/integration/notification-outbox.test.ts` (4 tests) verifying atomicity, transient backoff, 400 dead letter classification, and payment capture safety isolation.
  - UI tests: `tests/ui/audit-grid.test.tsx` (3 tests) & `tests/ui/settings-page.test.tsx` (2 tests).
  - Typecheck (`tsc --noEmit`): 0 errors.
  - Production build (`next build`): 17/17 pages static and dynamic routes compiled successfully.

---

## Roadmap & Next Gates

### Phase 9: Final Release Hardening & Operations
- Deliverables: Production hardening, monitoring dashboards, documentation, performance benchmarks.

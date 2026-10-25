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

## Roadmap & Next Gates

### Phase 6: PayPal Settlement & Idempotent Capture
- Deliverables: PayPal Orders v2 integration, webhook verification, idempotent capture transitions, state reconciliation.
- Gate: Phase 5 sealed mandates and WebAuthn authorizations verified.

### Phase 7: Operational Ledger, Evidence Trail & Verification
- Deliverables: Append-only ledger events with hash chaining, offline bundle export, independent verification viewer `/app/verify`, AG Grid operational table.

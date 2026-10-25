# ApproveRail Phase Status

## Phase 1: Foundation, Application Shell, and Operational Baselines (Current)

**Status**: In Progress / Completing Phase 1

### Scope & Deliverables
- [x] Greenfield Next.js App Router modular monolith initialized with pnpm, TypeScript strict mode, Tailwind CSS, Zod.
- [x] Inward-pointing source boundaries defined (`src/domain`, `src/application`, `src/infrastructure`, `src/app`, `src/ui`, `src/lib`).
- [x] Server-only validated configuration via Zod (`src/infrastructure/config/env.ts`).
- [x] Structured logger with secret redaction (`src/infrastructure/logging/logger.ts`).
- [x] Standardized RFC 9457-style API error handler (`src/infrastructure/errors/api-error.ts`).
- [x] Liveness probe `GET /api/v1/health` and database readiness probe `GET /api/v1/readiness` (accurately reports connected/disconnected).
- [x] Responsive accessible application shell:
  - Desktop: Persistent compact sidebar and main content layout.
  - Mobile: Compact header, 5-destination bottom navigation (`Home`, `Buy`, `Activity`, `Policies`, `More`), touch-friendly targets, zero horizontal overflow at 360px viewport.
- [x] Honest route placeholders for all Section 3 destinations (clearly stating feature phase and status, avoiding fake working mocks).
- [x] Local PostgreSQL `docker-compose.yml` service.
- [x] Complete documentation: `ARCHITECTURE.md`, `SECURITY_INVARIANTS.md`, `LOCAL_DEVELOPMENT.md`, `PHASE_STATUS.md`.
- [x] Vitest unit/UI tests, Playwright desktop navigation & mobile 360px smoke tests.

---

## Roadmap & Next Gates

### Phase 2: Tenancy, Principals, and Passkey Authentication
- Gate: Phase 1 checks passing, verified zero leakage of secrets, clean shell.
- Deliverables: PostgreSQL schema for `principals`, `passkeys`, `workspaces`, `workspace_members`. WebAuthn registration and authentication via `@simplewebauthn`, signed session cookies, workspace switching, server-side RBAC.

### Phase 3: Policy Versioning & Deterministic Evaluation
- Deliverables: Policy schema (`policies`), immutable versioning, integer minor unit budgets, rule parser and deterministic evaluation engine in `src/domain/policy`.

### Phase 4: Purchase Discovery & AI Research Assistance
- Deliverables: `purchase_requests`, Channel3 catalog integration, constrained Gemini assistant adapter with untrusted output isolation, candidate product selection.

### Phase 5: Proposal Review, Term Sealing & Passkey Authorization
- Deliverables: Immutable basket review, canonical hashing, tamper-evident proposal sealing, WebAuthn cryptographic assertion bound to proposal terms hash.

### Phase 6: PayPal Settlement & Idempotent Capture
- Deliverables: PayPal Orders v2 integration, webhook verification, idempotent capture transitions, state reconciliation.

### Phase 7: Operational Ledger, Evidence Trail & Verification
- Deliverables: Append-only ledger events with hash chaining, offline bundle export, independent verification viewer `/app/verify`, AG Grid operational table.

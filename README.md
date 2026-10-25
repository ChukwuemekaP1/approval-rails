# ApproveRail

**ApproveRail** is an AI-assisted purchasing and payment-control application for consumers and small businesses. A user explains what they need; the application researches catalog items; the AI can recommend but cannot authorize or execute payments; the user reviews the exact basket and merchant; deterministic server-side policy checks run; the user authorizes the exact terms using WebAuthn / FIDO2 passkeys; and the application prepares cryptographic purchase mandates.

---

## Architecture & Security Invariants

ApproveRail is built as a **Modular Monolith** using the Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL (Neon), and Drizzle ORM.

### Core Security Invariants

1. **Human-in-the-Loop Payment Authorization**: AI assistants research and synthesize options but cannot authorize or execute payments.
2. **Deterministic Server Policy Engine**: Policies evaluate strictly on the server with integer minor units (`bigint`); binary floating-point representation for money is prohibited.
3. **Hardware-Bound WebAuthn Authentication**: FIDO2 passkey registration and authentication via SimpleWebAuthn. No shared secrets or passwords stored.
4. **RFC 8785 Canonical Terms Hashing**: Proposal terms and line items are deterministically serialized and hashed with SHA-256. Any alteration immediately invalidates the authorization challenge.
5. **Multi-Tenant Isolation**: Strict workspace tenant boundaries enforced in database schemas, foreign keys, and application authorization services.

---

## Implemented Phases

- **Phase 1: Foundation & Operational Baselines**: Modular monolith architecture, inward dependency direction, Zod validated config, structured logger, RFC 9457 Problem Details, health/readiness probes, responsive app shell (360px mobile viewport certified).
- **Phase 2: Tenancy & Passkey Authentication**: Neon PostgreSQL migrations, WebAuthn passkey registration/authentication, secure sessions, multi-tenancy workspaces, role-based access.
- **Phase 3: Deterministic Policy Engine**: Immutable versioned policies, integer minor units currency conversion, deterministic policy evaluator, `/app/policies` UI.
- **Phase 4: Purchase Requests & Catalog Research**: Purchase intents, Channel3 & fixture catalog adapters, constrained Gemini research synthesis, `/app/purchases` UI.
- **Phase 5: Mandates, Canonical Hashing & Sealing**: Unsigned basket review, RFC 8785 JCS canonicalization, SHA-256 terms digest, tamper-evident proposal sealing, passkey authorization flow, `/app/proposals/[proposalId]` UI.

---

## Quick Start

### Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x
- PostgreSQL database (or Neon serverless connection string)

### Installation
```bash
pnpm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure `DATABASE_URL`, `WEBAUTHN_RP_ID`, and optional AI provider credentials (`GEMINI_API_KEY`, `CHANNEL3_API_KEY`).

### Database Migrations
```bash
pnpm db:migrate
```

### Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Verification & Testing

ApproveRail includes comprehensive testing suites across all layers:

```bash
# Type check
pnpm typecheck

# Linting
pnpm lint

# Unit, integration, and UI tests
pnpm test

# End-to-end browser tests (Playwright)
pnpm test:e2e

# Production build
pnpm build
```

---

## Deployment on Render

ApproveRail includes native support for **Render** via its Blueprint specification (`render.yaml`) and multi-stage `Dockerfile`.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

- **One-Click Blueprint**: Automatically provisions the Next.js web application and managed PostgreSQL database.
- **Automated Migrations**: Drizzle ORM migrations run before release via `preDeployCommand`.
- **Health Probes**: Automated rolling zero-downtime updates via `/api/v1/health`.
- See the complete [Render Deployment Guide](docs/render-deployment.md).

---

## Documentation Links

- [Render Deployment Guide](docs/render-deployment.md)

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Security Invariants](docs/SECURITY_INVARIANTS.md)
- [Phase Status Report](docs/PHASE_STATUS.md)
- [Policy Engine Specification](docs/POLICIES.md)
- [Purchases & Catalog Research](docs/PURCHASES_AND_CATALOG.md)
- [Proposals, Mandates & Sealing](docs/PROPOSALS_AND_MANDATES.md)
- [Local Development Guide](docs/LOCAL_DEVELOPMENT.md)

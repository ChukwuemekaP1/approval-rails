# ApproveRail Architecture Document

## 1. Product Scope

**ApproveRail** is an AI-assisted purchasing and payment-control application for consumers and small businesses.
1. A user explains what they need.
2. The application researches catalog items (Channel3 + Gemini).
3. The AI can recommend but **cannot authorize or execute a payment**.
4. The user reviews the exact basket and merchant.
5. Deterministic server-side policy checks run against the authoritative active policy.
6. The user authorizes the exact canonical terms (WebAuthn passkey).
7. PayPal handles the payment.
8. The application records a tamper-evident evidence trail.

## 2. Greenfield Boundary & Design Principles

- **Zero legacy code reuse**: Built as a clean, forward-only greenfield implementation.
- **No speculative mocks**: Features that are not yet implemented are clearly labeled as planned/Phase X placeholders rather than masquerading as working implementations.
- **Modular Monolith**: Kept as a single deployable Next.js App Router application backed by a separately managed PostgreSQL database. No microservices, distributed orchestration, or external queueing needed for the initial phases.

## 3. Dependency Inversion and Source Boundaries

All dependencies point strictly inward:

```
[UI / App Router Routes] ──> [Application Use Cases] <── [Infrastructure Adapters]
                                      │
                                      ▼
                               [Domain Layer]
                              (Zero Dependencies)
```

### Directory Structure & Responsibilities:

- **`src/domain/`**: Pure types, domain entities, money calculations (integer minor units), policy evaluation algorithms, mandate states, payment state transitions, and cryptographic canonicalization/verification.
  - **Rules**: Zero external dependencies. No framework imports (React/Next), no database clients, no provider SDKs, no network access, no random ID generators, no hidden clock reads (`Date.now()` passed explicitly).
- **`src/application/`**: Use case interactors, typed request/response boundaries, port interfaces (repositories, payment gateways, catalog search, notification dispatchers), transaction boundaries, and authorization checks.
- **`src/infrastructure/`**: Concrete implementations of application ports. PostgreSQL/Drizzle database clients and repositories, schema definitions and migrations, PayPal API adapter, Gemini AI adapter, Channel3 adapter, WebAuthn adapter, structured logger (Pino with secret redaction), environment configuration validator (Zod), and notification outbox worker.
- **`src/app/`**: Next.js App Router layouts, pages, and route handlers. Responsible for HTTP request parsing, cookie/header extraction, and invoking application use cases.
- **`src/ui/`**: Reusable accessible UI primitives, design tokens, responsive layout shells, navigation bars, and feature components.
- **`src/lib/`**: Small pure utility functions (e.g., string formatting, pure math helpers). Must not be used to circumvent architectural boundaries.
- **`tests/`**:
  - `tests/unit/`: Pure domain logic, validators, and infrastructure unit tests.
  - `tests/ui/`: Component accessibility and render tests using React Testing Library.
  - `tests/integration/`: Use cases with test database / mocked adapter harnesses.
  - `tests/e2e/`: Full browser navigation and smoke flows using Playwright.
- **`docs/`**: Architecture, invariants, API contracts, local development, and phase milestones.

## 4. Core Technology Stack

- **Runtime & Language**: Node.js >= 20, TypeScript Strict Mode.
- **Package Manager**: `pnpm` (lockfile committed).
- **Web Framework**: Next.js App Router (React 19).
- **Styling & Design Tokens**: Tailwind CSS, accessible semantic HTML with high-contrast focus states.
- **Schema Validation**: Zod at every external boundary (environment variables, HTTP request bodies, external provider payloads).
- **Persistence & Migration**: PostgreSQL with Drizzle ORM, forward-only migrations.
- **Structured Logging**: Pino with automated credential and secret masking.
- **Testing**: Vitest (unit/UI), React Testing Library, Playwright (E2E).
- **Explicit Exclusions**: Redis, Kubernetes, APIMatic runtime, Elastic, Kernel, or external broker queues are explicitly excluded from the initial architecture. PostgreSQL provides transactional persistence and outbox delivery.

# ApproveRail

> **"AI proposes. You authorize. Every payment leaves proof."**

ApproveRail is an AI-assisted procurement and payment-governance platform for individuals and businesses. Users discover real products from live merchants, refine specific requirements, build persistent multi-item procurement baskets, enforce deterministic spending limits, obtain managerial approvals, authorize purchases cryptographically with WebAuthn passkeys or PIN, settle securely with PayPal, and maintain an immutable hash-chained audit ledger.

---

## 1. Complete End-to-End User Journey

```
PUBLIC LANDING PAGE (/)
    │  Click "Create Account" or "Get Started"
    ▼
SIGN-UP PAGE (/signup)
    │  Create account (Name, Email, Password) -> Session cookie set
    ▼
WORKSPACE ONBOARDING (/onboarding)
    │  Step 1: Choose Sphere (Personal Workspace or Business Organization)
    │  Step 2: Configure Workspace Name, Currency (USD/EUR/GBP), Transaction & Monthly Caps
    │  Step 3 (Business): Set Manager Email & Approval Threshold
    ▼
AUTHENTICATED PROCUREMENT DASHBOARD (/app)
    ├── Product Discovery & Live Refinement (/app/shop)
    ├── Persistent Procurement Basket (/app/cart)
    ├── Purchase Proposals (/app/proposals)
    ├── Pending Manager Approvals (/app/approvals)
    ├── Authoritative Spending Policies (/app/policies)
    ├── Operational Hash-Chained Audit Ledger (/app/ledger)
    ├── Workspace & Team Member Management (/app/workspaces)
    └── Settings & Notifications (/app/settings)
```

**Returning Users:**
`Public Landing Page (/)` ➔ `Log In (/login)` ➔ If onboarding incomplete: `/onboarding`, otherwise: `/app`.

---

## 2. Core Architectural & Security Invariants

1. **AI Output Is Untrusted Data**: AI assistants (Gemini, Channel3) recommend products and synthesize specs, but never possess payment keys, execute transactions, or bypass server policies.
2. **Strict Integer Minor-Unit Arithmetic**: Authoritative financial calculations use `bigint` minor units (e.g., $100.00 = `10000n`). Floating-point arithmetic for money is strictly prohibited.
3. **Deterministic Server Policy Enforcement**: Spending rules are enforced exclusively on the server against the database-stored active policy; client-supplied policies are ignored.
4. **Segregation of Duties**: In business workspaces requiring manager approval, requesters cannot approve their own high-value proposals.
5. **Canonical RFC 8785 Hashing**: Purchase terms and line items are serialized canonically and hashed with SHA-256 (`termsHash`). Any change in merchant, item, or price immediately invalidates prior consent.
6. **Immutable Hash-Chained Ledger**: Every operational event is recorded with `H_n = SHA-256(H_{n-1} || payload)`, creating a tamper-evident audit trail viewable via AG Grid.

---

## 3. Local Installation & Development

### Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x
- PostgreSQL database (local or Neon/Render Postgres)

### Step-by-Step Setup
1. **Clone and Install Dependencies**:
   ```bash
   git clone https://github.com/<your-repo>/approve_rail.git
   cd approve_rail
   pnpm install --frozen-lockfile
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your `DATABASE_URL` and `SESSION_SECRET` (see checklist below).

3. **Run Database Migrations**:
   ```bash
   pnpm db:migrate
   ```

4. **Start the Development Server**:
   ```bash
   pnpm dev
   ```
   Access the app at `http://localhost:3000`.

5. **Run Verification Commands**:
   ```bash
   pnpm typecheck   # TypeScript check (0 errors)
   pnpm test:unit   # Unit test suite (101 tests)
   pnpm test:ui     # UI test suite (33 tests)
   pnpm build       # Optimized Next.js production build
   ```

---

## 4. Render Deployment Guide

ApproveRail is pre-configured with a Render Blueprint (`render.yaml`).

### Deploying to Render:
1. Connect your GitHub repository to [Render](https://dashboard.render.com).
2. Click **New +** ➔ **Blueprint** and select the ApproveRail repository.
3. Render automatically provisions:
   - **PostgreSQL Database** (`approverail-db`) in the `oregon` region.
   - **Web Service** (`approverail`) running Node.js with Next.js App Router.
   - Automatic execution of `pnpm db:migrate` prior to startup.
4. Supply any optional third-party API credentials in the Render Dashboard Environment settings (e.g., `CHANNEL3_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`).
5. Render deploys the web service with zero manual server configuration.

---

## 5. Definitive Environment Variables Checklist

| Variable | Group | Required | Where to Obtain / Notes |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Core | Yes | Set to `production` on Render, `development` locally. |
| `PORT` | Core | Yes | Defaults to `3000`. Handled automatically on Render. |
| `APP_URL` | Core | Yes | Local: `http://localhost:3000`. Render: `https://<service-name>.onrender.com`. |
| `DATABASE_URL` | Database | Yes | PostgreSQL connection string. Provided by Render Postgres (`approverail-db`). |
| `SESSION_SECRET` | Security | Yes | 32+ character random secret string. Auto-generated by Render blueprint. |
| `DEV_AUTH_PIN` | Auth | Optional | Defaults to `123456` for instant local PIN authentication. |
| `WEBAUTHN_RP_ID` | Auth | Optional | Relying Party ID. Local: `localhost`. Production: your domain (e.g., `onrender.com`). |
| `WEBAUTHN_ORIGIN` | Auth | Optional | Relying Party Origin. Local: `http://localhost:3000`. Production: your full URL. |
| `CHANNEL3_API_KEY` | Provider | Optional | Channel3 developer portal (`https://connect.trychannel3.com/developers`). Required for live product catalog. |
| `CHANNEL3_BASE_URL` | Provider | Optional | Defaults to `https://api.trychannel3.com`. |
| `GEMINI_API_KEY` | Provider | Optional | Google AI Studio (`https://aistudio.google.com`). Used for research synthesis. |
| `PAYPAL_CLIENT_ID` | Payment | Optional | PayPal Developer Dashboard (`https://developer.paypal.com`). Sandbox recommended. |
| `PAYPAL_CLIENT_SECRET` | Payment | Optional | PayPal Developer Dashboard (`https://developer.paypal.com`). |
| `PAYPAL_MODE` | Payment | Optional | Defaults to `sandbox`. |
| `PAYPAL_WEBHOOK_ID` | Payment | Optional | PayPal Webhook configuration for capturing asynchronous payment events. |
| `ZAPIER_WEBHOOK_URL` | Integration | Optional | Zapier webhook endpoint for outbox notification dispatch. |

---

## 6. Live Channel3 Integration Diagnostics

To verify live Channel3 connectivity from any environment:
- **CLI Diagnostic Script**:
  ```bash
  npx tsx scripts/check-channel3.ts
  ```
- **Health Check Endpoint**:
  ```bash
  curl http://localhost:3000/api/v1/catalog/health
  ```
  Returns status, latency in milliseconds, DNS resolution, and redacted error diagnostics. If local network egress to AWS API Gateway times out, the application clearly indicates this condition and provides a retry mechanism while keeping all core procurement features functional.

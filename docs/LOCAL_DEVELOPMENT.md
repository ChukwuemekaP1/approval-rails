# ApproveRail Local Development Guide

## Prerequisites

- **Node.js**: v20 or v22+ (tested on Node v24 LTS)
- **Package Manager**: `pnpm` v12+
- **Database**: PostgreSQL 15+ (optional for basic shell/health checks, required for full DB readiness)

## Quick Start

### 1. Clone & Install Dependencies
```bash
pnpm install
```

### 2. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env.local
```

Key environment variables:
- `NODE_ENV`: `development` | `production` | `test`
- `PORT`: `3000`
- `APP_URL`: `http://localhost:3000`
- `LOG_LEVEL`: `debug` | `info` | `warn` | `error`
- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/approve_rail`

### 3. Local PostgreSQL (Optional via Docker Compose)
If Docker is installed:
```bash
docker compose up -d postgres
```
Alternatively, configure `DATABASE_URL` in `.env.local` to point to any running local PostgreSQL instance.

### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Purpose |
| :--- | :--- |
| `pnpm dev` | Start Next.js App Router development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint across codebase |
| `pnpm typecheck` | Run TypeScript compiler strict type check (`tsc --noEmit`) |
| `pnpm test` | Run all Vitest unit and UI tests |
| `pnpm test:unit` | Run Vitest unit tests |
| `pnpm test:ui` | Run Vitest UI component tests |
| `pnpm test:e2e` | Run Playwright end-to-end tests (desktop & mobile 360px) |
| `pnpm db:generate` | Generate Drizzle migrations from schema |
| `pnpm db:migrate` | Execute Drizzle migrations against PostgreSQL |

## Health and Readiness Probes

ApproveRail exposes standardized operational status endpoints:

- **`GET /api/v1/health`**:
  - Always returns `200 OK` with JSON `{ "status": "ok", "service": "approve-rail", "timestamp": "...", "correlationId": "..." }`.
  - Used for container liveness probes.
- **`GET /api/v1/readiness`**:
  - Validates active database connectivity.
  - If PostgreSQL is reachable and executing queries: returns `200 OK` with `{ "status": "ready", "database": { "status": "connected", "latencyMs": 5 } }`.
  - If PostgreSQL is unreachable or unconfigured: returns `503 Service Unavailable` with detailed diagnosis `{ "status": "unready", "database": { "status": "disconnected", "error": "..." } }`.

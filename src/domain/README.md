# Domain Layer (`src/domain`)

## Invariants & Rules
- **Pure TypeScript logic and domain models only.**
- **Zero external dependencies**:
  - NO framework imports (React, Next.js).
  - NO database clients (pg, Drizzle).
  - NO network access (fetch, axios).
  - NO hidden clock reads (`Date.now()` or `new Date()` must be injected or passed as parameter).
  - NO random ID generators (`crypto.randomUUID()` must be injected).
- **Monetary calculations**: Must use integer minor units and explicit currency codes. Floating point is prohibited for authoritative amounts.

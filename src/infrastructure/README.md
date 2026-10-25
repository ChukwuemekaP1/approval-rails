# Infrastructure Layer (`src/infrastructure`)

## Invariants & Rules
- Implements ports defined in `src/application`.
- Adapts external systems: PostgreSQL database (Drizzle ORM), logging (Pino), environment validation (Zod), PayPal, Gemini, Channel3, WebAuthn.
- All secrets are server-only and validated at startup. Secrets must never be logged or leaked to client components.

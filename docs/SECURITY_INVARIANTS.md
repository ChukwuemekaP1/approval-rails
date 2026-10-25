# ApproveRail Non-Negotiable Security and Correctness Invariants

These invariants govern the entire ApproveRail architecture across all implementation phases. They must never be weakened or bypassed for UX convenience, feature speed, or code simplicity.

---

### Invariant 1: AI Isolation from Payment Signing & Authorization
> **The AI never receives PayPal credentials, payment signing secrets, passkey private keys, or a tool that can authorize or capture a payment.**
- AI tools and prompt contexts are strictly read-only or generative proposal assistants.
- Execution and payment authorization mechanisms are completely unreachable by AI logic.

### Invariant 2: Untrusted AI Output
> **AI output is untrusted data. Recommendations are not authorization.**
- Model completions, product extractions, and suggestions must be validated against authoritative schemas (via Zod).
- AI suggestions never constitute user intent, consent, or mandate approval.

### Invariant 3: Server-Side Authentication & Resource Authorization
> **Protected operations authenticate the caller and check workspace membership and resource ownership server-side. Hiding a button is not authorization.**
- UI gating is cosmetic. Every API endpoint and server action performs independent principal authentication and tenant/workspace authorization.

### Invariant 4: Authoritative Persisted Terms
> **Purchase proposals and payment amounts are derived from authoritative persisted terms. Do not trust a client-supplied total, policy document, merchant, or mandate hash.**
- Calculations (line item totals, taxes, discounts, currencies) are computed deterministically on the server.
- The client cannot supply arbitrary sums or terms.

### Invariant 5: Integer Minor Units for Currency
> **Use integer minor units and explicit currency exponent/formatting. Never use floating point as the authoritative monetary representation.**
- Amounts are stored and processed in minor currency units (e.g., cents for USD/EUR, integer pence for GBP, yen for JPY).
- IEEE-754 floating-point arithmetic is strictly prohibited in monetary domain logic.

### Invariant 6: Active Versioned Policy Enforcement
> **Persist policy versions and use the authoritative active policy from the database. A client cannot inject a policy into a proposal request.**
- Policies are immutable once published.
- The server resolves the active policy version from the database at evaluation time.

### Invariant 7: Cryptographic Binding of Human Authorization
> **Human authorization is bound to the exact canonical purchase terms. Any material change creates a new revision/hash and invalidates old approval.**
- A WebAuthn passkey assertion or signature signs the canonical hash of the exact proposal terms.
- Altering quantities, items, shipping, or merchant invalidates the seal and requires fresh human consent.

### Invariant 8: Explicit Payment State Transitions
> **All payment state transitions are explicit. UNKNOWN is not COMPLETED; timeouts must be reconciled, not guessed.**
- Incomplete, timed-out, or ambiguous payment states must remain pending or require explicit reconciliation with PayPal before changing state.

### Invariant 9: Idempotent Payment & Webhook Processing
> **Payment creation/capture and webhook processing must be idempotent. Concurrency must not produce duplicate capture or budget overspend.**
- Use unique idempotency keys, database transaction locks, and unique constraints to prevent double charges and race conditions.

### Invariant 10: Verified Webhooks & Deduplication
> **Verify PayPal webhook signatures and deduplicate verified event IDs.**
- Incoming webhooks are validated against PayPal's verification endpoint or signature certificates.
- Processed event IDs are stored with unique constraints; duplicates are safely acknowledged without re-execution.

### Invariant 11: Tamper-Evident Evidence Trail
> **Use an append-only evidence event model and independent chain/bundle verification. Describe it as tamper-evident, not absolutely tamper-proof against all privileged infrastructure attackers.**
- Ledger events are sequentially hashed with SHA-256 back-pointers.
- Offline bundles can be independently inspected and cryptographically verified.

### Invariant 12: Server-Only Secrets & Redaction
> **Secrets are server-only, validated at startup, excluded from logs and never committed.**
- Environment variables are validated on server initialization.
- Structured loggers use strict redaction masks for headers, authorization tokens, passwords, and API secrets.

### Invariant 13: Workspace Isolation at Database Layer
> **Workspace boundaries must exist in repository queries and database relationships, not just in the UI.**
- Every tenant query requires explicit `workspaceId` scoping.
- Global queries that filter after retrieval are forbidden.

### Invariant 14: Decoupled Outbound Notifications
> **Outbound notifications must not block, authorize, cancel, or alter a payment.**
- Outbound webhooks (e.g. Zapier) use an asynchronous transactional outbox.
- Failure of external notification services never compromises core financial settlement.

### Invariant 15: Empirical Integration Verification
> **Do not claim a live integration works without running a real test against its sandbox/API. Use explicit fixtures for offline tests.**
- Mocks and fixtures must be explicitly labeled as such in tests.
- Live features must be accompanied by integration tests against sandbox environments before marking complete.

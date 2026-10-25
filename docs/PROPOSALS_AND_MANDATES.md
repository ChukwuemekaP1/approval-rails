# Proposals, Terms Canonicalization, and Mandate Authorization (Phase 5)

## Overview
ApproveRail's Phase 5 introduces the purchase mandate lifecycle: transforming researched catalog candidates into an authoritative proposal, evaluating it deterministically against the workspace's active policy, canonicalizing the exact terms using RFC 8785 JSON Canonicalization Scheme (JCS), locking the terms through proposal sealing, and binding a WebAuthn / FIDO2 passkey authorization challenge strictly to the SHA-256 terms hash.

---

## Security Invariants Enforced

1. **Server-Calculated Monetary Totals (Invariant 5)**:
   - Line items, subtotals, and proposal totals are computed strictly on the server from confirmed candidate snapshots and integer quantities.
   - All arithmetic uses integer minor units (`bigint`). Floating point operations are strictly prohibited.
2. **Authoritative Policy Resolution (Invariant 6)**:
   - The proposal creation and revision workflows resolve the workspace's active policy authoritatively from the PostgreSQL database.
   - The client cannot supply a policy document or override policy decisions.
3. **Deterministic RFC 8785 Canonicalization & SHA-256 Hashing**:
   - Proposal terms (`currency`, `expiresAt`, `items`, `merchant`, `policyHash`, `policyVersion`, `requesterId`, `sourceRequestId`, `totalAmountMinor`, `workspaceId`) are recursively sorted lexicographically by key.
   - Line items are sorted by `candidateId` so array insertion order never alters the canonical digest.
   - BigInt minor units are serialized in canonical base-10 string format.
4. **Cryptographic WebAuthn Challenge Binding (Invariant 7)**:
   - To authorize a mandate, the proposal must first be locked (`SEALED`).
   - The server creates a single-use, 5-minute expiring challenge associated with `flowType = 'MANDATE_AUTHORIZATION'` and binds it to the proposal's `auth_challenge` column.
   - Any basket modification invalidates prior authorization challenges (`authChallenge = null`).
   - The server verifies the WebAuthn signature assertion against the user's registered passkey and verifies that `computeTermsHash(proposal.canonicalTermsJson) === proposal.termsHash` before transitioning the mandate to `AUTHORIZED`.
   - **Guarantee Precision**: WebAuthn proves an authenticator assertion with user verification/presence according to the credential settings bound to this exact terms digest. It does not claim to prove legal identity or make every device's biometric a portable signature.
5. **Multi-Tenant and Role Isolation**:
   - All operations require authenticated session, workspace membership, and resource authorization.
   - Policies flagged with `REQUIRES_ADMIN_APPROVAL` require the signing user to hold the `ADMIN` role.

---

## Proposal State Machine

```
         ┌───────────────┐
         │     DRAFT     │
         └───────┬───────┘
                 │ (evaluatePolicy passed)
                 ▼
         ┌───────────────┐  unsealProposal   ┌───────────────┐
         │ NEEDS_REVIEW  │ ◄──────────────── │    SEALED     │
         └───────┬───────┘                   └───────┬───────┘
                 │                                   │
                 │ sealProposal                      │ WebAuthn Passkey
                 ▼                                   │ Assertion Verified
         ┌───────────────┐                           ▼
         │    SEALED     │                   ┌───────────────┐
         └───────────────┘                   │  AUTHORIZED   │
                                             └───────────────┘
  Terminal / Error States:
  - BLOCKED: Triggered when policy evaluation fails
  - EXPIRED: Triggered when expiresAt < now
  - CANCELLED: Explicit cancellation
```

---

## API Endpoints

- `POST /api/v1/workspaces/:workspaceId/proposals`: Creates proposal from source request and basket items.
- `GET /api/v1/workspaces/:workspaceId/proposals`: Lists proposals for workspace.
- `GET /api/v1/workspaces/:workspaceId/proposals/:proposalId`: Retrieves proposal details.
- `PUT /api/v1/workspaces/:workspaceId/proposals/:proposalId/basket`: Revises unsigned basket quantities, recomputes terms, and invalidates pending challenges.
- `POST /api/v1/workspaces/:workspaceId/proposals/:proposalId/seal`: Transitions `NEEDS_REVIEW` to `SEALED`.
- `POST /api/v1/workspaces/:workspaceId/proposals/:proposalId/unseal`: Transitions `SEALED` back to `NEEDS_REVIEW` to permit revisions.
- `POST /api/v1/workspaces/:workspaceId/proposals/:proposalId/auth-options`: Generates WebAuthn authentication options bound to proposal terms hash.
- `POST /api/v1/workspaces/:workspaceId/proposals/:proposalId/authorize`: Verifies authenticator assertion and marks mandate `AUTHORIZED`.

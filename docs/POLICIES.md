# Spend Policies & Deterministic Evaluation (Phase 3)

## 1. Overview & Architecture

ApproveRail enforces spend governance through server-side deterministic policy evaluation. Spend policies protect organizations against unauthorized transactions, budget overflows, unapproved categories, and blocked vendors.

### Core Invariants

1. **Zero Floating-Point Money**: All financial quantities are strictly calculated, stored, and compared as integer minor units (`bigint`), eliminating IEEE-754 binary floating-point rounding errors and precision loss. Decimal conversion occurs only at user I/O boundaries.
2. **Authoritative Database Resolution**: The proposal and purchase flows resolve the active policy directly from PostgreSQL. A caller or client can never supply, substitute, or override an authoritative policy document.
3. **Monotonic Append-Only Versioning**: Policies are strictly append-only. Modifying a policy deactivates the prior version and persists version $N+1$ atomically inside a database transaction.
4. **Canonical Hashing & Immutable Proposal Binding**: Every policy version is serialized using deterministic key-sorted JSON and hashed with SHA-256. Sealed purchase proposals record the exact evaluated policy version and content hash. Later changes never alter existing purchase mandates or historical evaluation results.
5. **Role-Gated Activation**: Viewing active policies and version trails requires authenticated membership in the workspace. Publishing and activating new policy versions strictly requires the `ADMIN` role.

---

## 2. Policy Schema & Currency Representation

### Pure Domain Model (`src/domain/policy/types.ts`)

```typescript
export interface PolicyRules {
  currency: CurrencyCode;              // 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY'
  maxTransactionAmount: bigint;        // Integer minor units (e.g. 50000n = $500.00)
  monthlyBudgetCap: bigint;            // Integer minor units (e.g. 250000n = $2,500.00)
  requireAdminAbove?: bigint | null;   // Optional escalation threshold in minor units
  allowedCategories?: string[] | null; // Optional category allowlist
  blockedMerchants?: string[] | null;  // Optional merchant denylist
}

export interface Policy {
  id: string;
  workspaceId: string;
  version: number;
  name: string;
  rules: PolicyRules;
  canonicalContent: string;            // Deterministic key-sorted JSON
  contentHash: string;                 // SHA-256 hex digest
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}
```

### Supported Currencies & Minor Unit Decimals

| Currency | Symbol | Minor Decimals | 1 Major Unit in Minor | Example Input | Stored BigInt |
|:---|:---|:---:|:---:|:---:|:---:|
| **USD** | `$` | 2 | 100 cents | `"250.00"` | `25000n` |
| **EUR** | `€` | 2 | 100 cents | `"100.50"` | `10050n` |
| **GBP** | `£` | 2 | 100 pence | `"75.25"` | `7525n` |
| **CAD** | `CA$` | 2 | 100 cents | `"300.00"` | `30000n` |
| **AUD** | `A$` | 2 | 100 cents | `"180.00"` | `18000n` |
| **JPY** | `¥` | 0 | 1 yen | `"15000"` | `15000n` |

Fractional values are strictly disallowed for 0-decimal currencies like JPY.

---

## 3. Deterministic Evaluation Logic

Evaluation is executed as a pure deterministic function (`evaluatePolicy` in `src/domain/policy/evaluator.ts`) taking:
- `policy`: Authoritative workspace policy
- `context`: Proposed amount, currency, current cumulative monthly spend, merchant name, category
- `evaluatedAt`: Explicit timestamp (zero hidden clock reads in domain logic)

### Stable Reason Codes

| Reason Code | Status | Description |
|:---|:---|:---|
| `POLICY_OK` | `APPROVED` | All checks passed within approved thresholds. |
| `CURRENCY_MISMATCH` | `REJECTED` | Proposed currency does not match workspace policy currency. |
| `EXCEEDS_TRANSACTION_CAP` | `REJECTED` | Proposed amount exceeds `maxTransactionAmount`. |
| `EXCEEDS_MONTHLY_BUDGET` | `REJECTED` | Proposed amount + cumulative monthly spend exceeds `monthlyBudgetCap`. |
| `MERCHANT_BLOCKED` | `REJECTED` | Merchant name matches an entry in `blockedMerchants`. |
| `CATEGORY_DISALLOWED` | `REJECTED` | Merchant category is not contained in `allowedCategories`. |
| `REQUIRES_ADMIN_AUTHORIZATION`| `REQUIRES_ADMIN_APPROVAL` | Amount exceeds `requireAdminAbove` threshold but remains within transaction cap. |

---

## 4. Canonicalization & SHA-256 Digest

To guarantee cryptographic invariance across platforms:
1. Object properties are sorted alphabetically.
2. Minor unit bigints are serialized as base-10 strings without binary precision loss.
3. Nested string arrays are sorted and deduplicated.
4. SHA-256 digest is calculated over the canonical UTF-8 bytes.

```typescript
export function canonicalizePolicyRules(rules: PolicyRules): string {
  const canonicalObj = {
    allowedCategories: rules.allowedCategories ? [...rules.allowedCategories].sort() : null,
    blockedMerchants: rules.blockedMerchants ? [...rules.blockedMerchants].sort() : null,
    currency: rules.currency,
    maxTransactionAmount: rules.maxTransactionAmount.toString(10),
    monthlyBudgetCap: rules.monthlyBudgetCap.toString(10),
    requireAdminAbove: rules.requireAdminAbove ? rules.requireAdminAbove.toString(10) : null,
  };
  return JSON.stringify(canonicalObj, Object.keys(canonicalObj).sort());
}
```

---

## 5. API Contracts

### Active Policy
- **Endpoint**: `GET /api/v1/workspaces/:workspaceId/policy`
- **Auth**: Authenticated workspace member (`MEMBER` or `ADMIN`)
- **Behavior**: Retrieves active policy; automatically seeds documented default policy v1 for newly initialized workspaces.

### Version History
- **Endpoint**: `GET /api/v1/workspaces/:workspaceId/policy/versions`
- **Auth**: Authenticated workspace member (`MEMBER` or `ADMIN`)
- **Behavior**: Returns full historical version list in descending order.

### Publish New Version
- **Endpoint**: `POST /api/v1/workspaces/:workspaceId/policy`
- **Auth**: Authenticated workspace administrator (`ADMIN`)
- **Request Body**:
  ```json
  {
    "name": "Q4 Standard Spending Policy",
    "currency": "USD",
    "maxTransactionAmount": "500.00",
    "monthlyBudgetCap": "2500.00",
    "requireAdminAbove": "200.00",
    "allowedCategories": ["Software", "Office"],
    "blockedMerchants": ["UntrustedVendor"]
  }
  ```
- **Validation**:
  - `maxTransactionAmount > 0`
  - `monthlyBudgetCap > 0`
  - `maxTransactionAmount <= monthlyBudgetCap`
  - Currency valid and supported
- **Response**: `201 Created` with formatted DTO of new active version.

---

## 6. UI Implementation (`/app/policies`)

The `/app/policies` route delivers:
- **Active Policy Review**: Real-time cards showing currency, caps, admin escalation thresholds, SHA-256 hash copy button, and canonical JSON inspector.
- **Role-Aware Editor**: Enabled for `ADMIN`, read-only for `MEMBER`. Includes live validation error banners and dirty-state draft indicator ("Unsaved Changes").
- **Version History Table**: Full audit trail of versions, active vs archived badges, timestamps, creators, and rule inspection modal.
- **Invariant Notice Banner**: Reminds users that existing proposals remain permanently sealed against the exact policy version and hash evaluated at authorization time.

import { describe, it, expect } from 'vitest';
import {
  canonicalizePolicyRules,
  computePolicyContentHash,
} from '@/domain/policy/canonicalize';
import { PolicyRules } from '@/domain/policy/types';

describe('Domain: Policy Canonicalization & Hashing', () => {
  const sampleRulesA: PolicyRules = {
    currency: 'USD',
    maxTransactionAmount: 25000n, // $250.00
    monthlyBudgetCap: 100000n, // $1000.00
    requireAdminAbove: 10000n, // $100.00
    allowedCategories: ['Office', 'Software'],
    blockedMerchants: ['UntrustedVendor'],
  };

  it('produces deterministic key-sorted JSON representation', () => {
    const canonical = canonicalizePolicyRules(sampleRulesA);
    const parsed = JSON.parse(canonical);

    // Verify key ordering
    const keys = Object.keys(parsed);
    const sortedKeys = [...keys].sort();
    expect(keys).toEqual(sortedKeys);

    // BigInts must be serialized as strings
    expect(parsed.maxTransactionAmount).toBe('25000');
    expect(parsed.monthlyBudgetCap).toBe('100000');
    expect(parsed.requireAdminAbove).toBe('10000');
  });

  it('generates identical hash regardless of runtime object key order', () => {
    const rulesObj1: PolicyRules = {
      currency: 'USD',
      maxTransactionAmount: 25000n,
      monthlyBudgetCap: 100000n,
      requireAdminAbove: 10000n,
      allowedCategories: ['Office', 'Software'],
      blockedMerchants: ['UntrustedVendor'],
    };

    const rulesObj2: PolicyRules = {
      blockedMerchants: ['UntrustedVendor'],
      allowedCategories: ['Office', 'Software'],
      requireAdminAbove: 10000n,
      monthlyBudgetCap: 100000n,
      maxTransactionAmount: 25000n,
      currency: 'USD',
    };

    const hash1 = computePolicyContentHash(canonicalizePolicyRules(rulesObj1));
    const hash2 = computePolicyContentHash(canonicalizePolicyRules(rulesObj2));

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/); // Standard SHA-256 hex string
  });

  it('detects any change in monetary rules or restrictions with a distinct hash', () => {
    const baseHash = computePolicyContentHash(canonicalizePolicyRules(sampleRulesA));

    // Change max transaction by 1 cent
    const alteredRules: PolicyRules = {
      ...sampleRulesA,
      maxTransactionAmount: 25001n,
    };
    const alteredHash = computePolicyContentHash(canonicalizePolicyRules(alteredRules));

    expect(alteredHash).not.toBe(baseHash);
  });
});

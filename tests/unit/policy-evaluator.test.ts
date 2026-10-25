import { describe, it, expect } from 'vitest';
import { evaluatePolicy } from '@/domain/policy/evaluator';
import { Policy, PolicyEvaluationContext } from '@/domain/policy/types';

describe('Domain: Deterministic Policy Evaluator', () => {
  const dummyPolicy: Policy = {
    id: 'pol-123',
    workspaceId: 'ws-456',
    version: 1,
    name: 'Test Spending Policy',
    rules: {
      currency: 'USD',
      maxTransactionAmount: 25000n, // $250.00
      monthlyBudgetCap: 100000n, // $1,000.00
      requireAdminAbove: 10000n, // $100.00
      allowedCategories: ['Office', 'Software', 'Supplies'],
      blockedMerchants: ['UntrustedVendor', 'BannedShop'],
    },
    canonicalContent: '{}',
    contentHash: 'abc123hash',
    isActive: true,
    createdBy: 'princ-1',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  const evalDate = new Date('2026-01-15T12:00:00Z');

  it('approves a proposal strictly within limits', () => {
    const context: PolicyEvaluationContext = {
      proposedAmount: 5000n, // $50.00
      proposedCurrency: 'USD',
      monthlySpendToDate: 20000n, // $200.00
      merchantName: 'Acme Software',
      merchantCategory: 'Software',
    };

    const result = evaluatePolicy(dummyPolicy, context, evalDate);
    expect(result.passed).toBe(true);
    expect(result.status).toBe('APPROVED');
    expect(result.reasons).toEqual(['POLICY_OK']);
    expect(result.evaluatedPolicyVersion).toBe(1);
    expect(result.evaluatedPolicyHash).toBe('abc123hash');
  });

  it('rejects proposal when currency does not match policy currency', () => {
    const context: PolicyEvaluationContext = {
      proposedAmount: 5000n,
      proposedCurrency: 'EUR', // Mismatch!
      monthlySpendToDate: 0n,
      merchantName: 'Acme Software',
    };

    const result = evaluatePolicy(dummyPolicy, context, evalDate);
    expect(result.passed).toBe(false);
    expect(result.status).toBe('REJECTED');
    expect(result.reasons).toContain('CURRENCY_MISMATCH');
  });

  it('rejects proposal exceeding per-transaction cap', () => {
    const context: PolicyEvaluationContext = {
      proposedAmount: 30000n, // $300.00 > $250.00 cap
      proposedCurrency: 'USD',
      monthlySpendToDate: 0n,
      merchantName: 'Acme Software',
      merchantCategory: 'Software',
    };

    const result = evaluatePolicy(dummyPolicy, context, evalDate);
    expect(result.passed).toBe(false);
    expect(result.status).toBe('REJECTED');
    expect(result.reasons).toContain('EXCEEDS_TRANSACTION_CAP');
  });

  it('rejects proposal exceeding monthly budget cap', () => {
    const context: PolicyEvaluationContext = {
      proposedAmount: 15000n, // $150.00 (within $250 max tx)
      proposedCurrency: 'USD',
      monthlySpendToDate: 90000n, // $900 + $150 = $1,050 > $1,000 monthly cap
      merchantName: 'Acme Software',
      merchantCategory: 'Software',
    };

    const result = evaluatePolicy(dummyPolicy, context, evalDate);
    expect(result.passed).toBe(false);
    expect(result.status).toBe('REJECTED');
    expect(result.reasons).toContain('EXCEEDS_MONTHLY_BUDGET');
  });

  it('rejects proposal from blocked merchant regardless of amount', () => {
    const context: PolicyEvaluationContext = {
      proposedAmount: 1000n, // $10.00
      proposedCurrency: 'USD',
      monthlySpendToDate: 0n,
      merchantName: 'UntrustedVendor', // Blocked!
      merchantCategory: 'Software',
    };

    const result = evaluatePolicy(dummyPolicy, context, evalDate);
    expect(result.passed).toBe(false);
    expect(result.status).toBe('REJECTED');
    expect(result.reasons).toContain('MERCHANT_BLOCKED');
  });

  it('rejects proposal with disallowed merchant category', () => {
    const context: PolicyEvaluationContext = {
      proposedAmount: 1000n,
      proposedCurrency: 'USD',
      monthlySpendToDate: 0n,
      merchantName: 'Fun Games Inc',
      merchantCategory: 'Gambling', // Not in ['Office', 'Software', 'Supplies']
    };

    const result = evaluatePolicy(dummyPolicy, context, evalDate);
    expect(result.passed).toBe(false);
    expect(result.status).toBe('REJECTED');
    expect(result.reasons).toContain('CATEGORY_DISALLOWED');
  });

  it('escalates to REQUIRES_ADMIN_APPROVAL when amount exceeds admin threshold but stays under transaction cap', () => {
    const context: PolicyEvaluationContext = {
      proposedAmount: 15000n, // $150.00 (exceeds $100 admin threshold, within $250 cap)
      proposedCurrency: 'USD',
      monthlySpendToDate: 10000n,
      merchantName: 'Acme Software',
      merchantCategory: 'Software',
    };

    const result = evaluatePolicy(dummyPolicy, context, evalDate);
    expect(result.passed).toBe(true);
    expect(result.status).toBe('REQUIRES_ADMIN_APPROVAL');
    expect(result.reasons).toContain('REQUIRES_ADMIN_AUTHORIZATION');
  });
});

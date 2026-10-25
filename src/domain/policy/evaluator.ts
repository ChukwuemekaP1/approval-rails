import {
  Policy,
  PolicyEvaluationContext,
  PolicyEvaluationResult,
  PolicyReasonCode,
} from './types';

/**
 * Pure deterministic policy evaluator.
 * Guarantees zero side effects, no floating point arithmetic, and explicit time injection.
 */
export function evaluatePolicy(
  policy: Policy,
  context: PolicyEvaluationContext,
  evaluatedAt: Date
): PolicyEvaluationResult {
  const reasons: PolicyReasonCode[] = [];
  const rules = policy.rules;

  // 1. Currency alignment check
  if (context.proposedCurrency !== rules.currency) {
    reasons.push('CURRENCY_MISMATCH');
  }

  // 2. Per-transaction cap check (minor units comparison)
  if (context.proposedAmount > rules.maxTransactionAmount) {
    reasons.push('EXCEEDS_TRANSACTION_CAP');
  }

  // 3. Monthly cumulative budget check
  const projectedMonthlySpend = context.monthlySpendToDate + context.proposedAmount;
  if (projectedMonthlySpend > rules.monthlyBudgetCap) {
    reasons.push('EXCEEDS_MONTHLY_BUDGET');
  }

  // 4. Blocked merchant denylist check
  if (rules.blockedMerchants && rules.blockedMerchants.length > 0) {
    const normalizedMerchant = context.merchantName.toLowerCase().trim();
    const isBlocked = rules.blockedMerchants.some(
      (blocked) => blocked.toLowerCase().trim() === normalizedMerchant
    );
    if (isBlocked) {
      reasons.push('MERCHANT_BLOCKED');
    }
  }

  // 5. Allowed merchant category allowlist check
  if (rules.allowedCategories && rules.allowedCategories.length > 0) {
    const category = context.merchantCategory?.trim().toLowerCase();
    const isAllowed = category
      ? rules.allowedCategories.some((c) => c.toLowerCase().trim() === category)
      : false;
    if (!isAllowed) {
      reasons.push('CATEGORY_DISALLOWED');
    }
  }

  // If any hard rejections triggered
  if (reasons.length > 0) {
    return {
      passed: false,
      status: 'REJECTED',
      reasons,
      evaluatedPolicyVersion: policy.version,
      evaluatedPolicyHash: policy.contentHash,
      evaluatedAt,
    };
  }

  // 6. Admin threshold check (requires escalation rather than outright rejection)
  if (
    rules.requireAdminAbove &&
    rules.requireAdminAbove > 0n &&
    context.proposedAmount > rules.requireAdminAbove
  ) {
    return {
      passed: true,
      status: 'REQUIRES_ADMIN_APPROVAL',
      reasons: ['REQUIRES_ADMIN_AUTHORIZATION'],
      evaluatedPolicyVersion: policy.version,
      evaluatedPolicyHash: policy.contentHash,
      evaluatedAt,
    };
  }

  return {
    passed: true,
    status: 'APPROVED',
    reasons: ['POLICY_OK'],
    evaluatedPolicyVersion: policy.version,
    evaluatedPolicyHash: policy.contentHash,
    evaluatedAt,
  };
}

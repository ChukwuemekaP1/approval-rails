import crypto from 'crypto';
import { PolicyRules } from './types';

/**
 * Deterministically sorts and canonicalizes policy rules into a normalized JSON string.
 * Ensures identical rules always produce the exact same byte representation.
 */
export function canonicalizePolicyRules(rules: PolicyRules): string {
  const normalized = {
    allowedCategories: rules.allowedCategories
      ? [...rules.allowedCategories].sort()
      : null,
    blockedMerchants: rules.blockedMerchants
      ? [...rules.blockedMerchants].map((m) => m.toLowerCase().trim()).sort()
      : null,
    currency: rules.currency,
    maxTransactionAmount: rules.maxTransactionAmount.toString(),
    monthlyBudgetCap: rules.monthlyBudgetCap.toString(),
    requireAdminAbove: rules.requireAdminAbove
      ? rules.requireAdminAbove.toString()
      : null,
  };

  return JSON.stringify(normalized, Object.keys(normalized).sort());
}

/**
 * Computes a SHA-256 hex digest of the canonical policy rules.
 */
export function computePolicyContentHash(canonicalContent: string): string {
  return crypto.createHash('sha256').update(canonicalContent, 'utf8').digest('hex');
}

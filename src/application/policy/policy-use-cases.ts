import { policyRepo, CreatePolicyInput } from '@/infrastructure/repositories/policy-repository';
import { authorizationService } from '@/application/auth/authorization-service';
import { ApiError } from '@/infrastructure/errors/api-error';
import {
  Policy,
  PolicyEvaluationContext,
  PolicyEvaluationResult,
} from '@/domain/policy/types';
import { evaluatePolicy } from '@/domain/policy/evaluator';
import { CurrencyCode, formatMinorUnitsToDecimal } from '@/domain/money/currency';

export interface FormattedPolicyDTO {
  id: string;
  workspaceId: string;
  version: number;
  name: string;
  currency: CurrencyCode;
  maxTransactionAmount: string; // Decimal string (e.g. "500.00")
  maxTransactionAmountMinor: string; // Minor units as string (e.g. "50000")
  monthlyBudgetCap: string; // Decimal string (e.g. "2500.00")
  monthlyBudgetCapMinor: string; // Minor units as string (e.g. "250000")
  requireAdminAbove: string | null;
  requireAdminAboveMinor: string | null;
  allowedCategories: string[] | null;
  blockedMerchants: string[] | null;
  canonicalContent: string;
  contentHash: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export function formatPolicyToDTO(policy: Policy): FormattedPolicyDTO {
  return {
    id: policy.id,
    workspaceId: policy.workspaceId,
    version: policy.version,
    name: policy.name,
    currency: policy.rules.currency,
    maxTransactionAmount: formatMinorUnitsToDecimal(
      policy.rules.maxTransactionAmount,
      policy.rules.currency
    ),
    maxTransactionAmountMinor: policy.rules.maxTransactionAmount.toString(),
    monthlyBudgetCap: formatMinorUnitsToDecimal(
      policy.rules.monthlyBudgetCap,
      policy.rules.currency
    ),
    monthlyBudgetCapMinor: policy.rules.monthlyBudgetCap.toString(),
    requireAdminAbove: policy.rules.requireAdminAbove
      ? formatMinorUnitsToDecimal(policy.rules.requireAdminAbove, policy.rules.currency)
      : null,
    requireAdminAboveMinor: policy.rules.requireAdminAbove
      ? policy.rules.requireAdminAbove.toString()
      : null,
    allowedCategories: policy.rules.allowedCategories || null,
    blockedMerchants: policy.rules.blockedMerchants || null,
    canonicalContent: policy.canonicalContent,
    contentHash: policy.contentHash,
    isActive: policy.isActive,
    createdBy: policy.createdBy,
    createdAt: policy.createdAt.toISOString(),
  };
}

export class PolicyUseCases {
  /**
   * Retrieves the active policy for the workspace.
   * If none exists yet, automatically seeds a documented default policy.
   */
  async getActivePolicy(
    principalId: string,
    workspaceId: string
  ): Promise<FormattedPolicyDTO> {
    await authorizationService.authorizeWorkspace(principalId, workspaceId);

    const policy = await policyRepo.ensureDefaultPolicy(workspaceId, principalId);
    return formatPolicyToDTO(policy);
  }

  /**
   * Lists historical immutable policy versions for the workspace.
   */
  async listVersions(
    principalId: string,
    workspaceId: string
  ): Promise<FormattedPolicyDTO[]> {
    await authorizationService.authorizeWorkspace(principalId, workspaceId);

    const versions = await policyRepo.listVersions(workspaceId);
    return versions.map(formatPolicyToDTO);
  }

  /**
   * Creates and activates a new policy version.
   * Gated strictly by ADMIN workspace authorization.
   */
  async createAndActivateVersion(
    principalId: string,
    workspaceId: string,
    input: CreatePolicyInput
  ): Promise<FormattedPolicyDTO> {
    // Requires ADMIN role in this workspace
    await authorizationService.authorizeWorkspace(principalId, workspaceId, 'ADMIN');

    if (input.maxTransactionAmount <= 0n) {
      throw ApiError.badRequest('Per-transaction cap must be greater than zero');
    }

    if (input.monthlyBudgetCap <= 0n) {
      throw ApiError.badRequest('Monthly budget cap must be greater than zero');
    }

    if (input.maxTransactionAmount > input.monthlyBudgetCap) {
      throw ApiError.badRequest(
        'Per-transaction cap cannot exceed the monthly budget cap'
      );
    }

    const created = await policyRepo.createAndActivate(workspaceId, input, principalId);
    return formatPolicyToDTO(created);
  }

  /**
   * Authoritatively evaluates a proposed basket against the active stored policy.
   * NEVER accepts a client-injected policy document.
   */
  async evaluateProposal(
    principalId: string,
    workspaceId: string,
    proposalTerms: {
      proposedAmount: bigint;
      proposedCurrency: CurrencyCode;
      merchantName: string;
      merchantCategory?: string | null;
      monthlySpendToDate?: bigint;
    }
  ): Promise<PolicyEvaluationResult> {
    await authorizationService.authorizeWorkspace(principalId, workspaceId);

    // Load active policy directly from DB
    const policy = await policyRepo.ensureDefaultPolicy(workspaceId, principalId);

    const evaluationContext: PolicyEvaluationContext = {
      proposedAmount: proposalTerms.proposedAmount,
      proposedCurrency: proposalTerms.proposedCurrency,
      monthlySpendToDate: proposalTerms.monthlySpendToDate || 0n,
      merchantName: proposalTerms.merchantName,
      merchantCategory: proposalTerms.merchantCategory,
    };

    return evaluatePolicy(policy, evaluationContext, new Date());
  }
}

export const policyUseCases = new PolicyUseCases();

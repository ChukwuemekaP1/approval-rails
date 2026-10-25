import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { policyRepo } from '@/infrastructure/repositories/policy-repository';
import { policyUseCases } from '@/application/policy/policy-use-cases';

describe('Policy Versioning & Engine Database Integration (PostgreSQL)', () => {
  const testRunId = crypto.randomUUID().slice(0, 8);

  it(
    'seeds default policy v1 and increments version monotonically upon admin update',
    async () => {
      // 1. Create Admin user and workspace
      const admin = await principalRepo.create({
        email: `admin-policy-${testRunId}@example.com`,
        displayName: 'Policy Admin',
      });

      const ws = await workspaceRepo.create({
        name: `Policy Workspace ${testRunId}`,
        type: 'BUSINESS',
        createdBy: admin.id,
      });

      // 2. Query active policy -> automatically seeds default policy v1
      const defaultPolicy = await policyUseCases.getActivePolicy(admin.id, ws.id);
      expect(defaultPolicy.version).toBe(1);
      expect(defaultPolicy.isActive).toBe(true);
      expect(defaultPolicy.currency).toBe('USD');
      expect(defaultPolicy.maxTransactionAmount).toBe('500.00');
      expect(defaultPolicy.monthlyBudgetCap).toBe('2500.00');
      expect(defaultPolicy.contentHash).toMatch(/^[a-f0-9]{64}$/);

      const v1Hash = defaultPolicy.contentHash;

      // 3. Admin creates and activates Version 2 with custom limits
      const v2 = await policyUseCases.createAndActivateVersion(admin.id, ws.id, {
        name: 'Updated Enterprise Policy',
        currency: 'USD',
        maxTransactionAmount: 75000n, // $750.00
        monthlyBudgetCap: 300000n, // $3,000.00
        requireAdminAbove: 30000n, // $300.00
        allowedCategories: ['Software', 'Hardware'],
        blockedMerchants: ['ShadyMerchant'],
      });

      expect(v2.version).toBe(2);
      expect(v2.isActive).toBe(true);
      expect(v2.maxTransactionAmount).toBe('750.00');
      expect(v2.contentHash).not.toBe(v1Hash);

      // 4. Verify version history: Version 1 is archived (isActive: false) and immutable
      const versions = await policyUseCases.listVersions(admin.id, ws.id);
      expect(versions).toHaveLength(2);

      const historicalV1 = versions.find((v) => v.version === 1);
      const activeV2 = versions.find((v) => v.version === 2);

      expect(historicalV1).toBeDefined();
      expect(historicalV1?.isActive).toBe(false);
      expect(historicalV1?.contentHash).toBe(v1Hash); // Immutable hash preserved

      expect(activeV2).toBeDefined();
      expect(activeV2?.isActive).toBe(true);
      expect(activeV2?.id).toBe(v2.id);

      // 5. Active policy query now yields v2
      const currentActive = await policyUseCases.getActivePolicy(admin.id, ws.id);
      expect(currentActive.version).toBe(2);
      expect(currentActive.contentHash).toBe(v2.contentHash);
    },
    30000
  );

  it(
    'enforces role-based authorization: non-admin (MEMBER) cannot publish policy version',
    async () => {
      // 1. Create Workspace with Admin
      const admin = await principalRepo.create({
        email: `admin2-${testRunId}@example.com`,
        displayName: 'Workspace Admin',
      });

      const member = await principalRepo.create({
        email: `member-${testRunId}@example.com`,
        displayName: 'Standard Member',
      });

      const ws = await workspaceRepo.create({
        name: `Auth Policy WS ${testRunId}`,
        type: 'BUSINESS',
        createdBy: admin.id,
      });

      // Add regular member to workspace
      await workspaceRepo.addMember(ws.id, member.id, 'MEMBER');

      // 2. Member CAN view active policy
      const memberView = await policyUseCases.getActivePolicy(member.id, ws.id);
      expect(memberView.version).toBe(1);

      // 3. Member CANNOT publish/activate new policy version
      await expect(
        policyUseCases.createAndActivateVersion(member.id, ws.id, {
          name: 'Unauthorized Member Attempt',
          currency: 'USD',
          maxTransactionAmount: 100000n,
          monthlyBudgetCap: 500000n,
        })
      ).rejects.toThrowError(/Administrator privileges required/i);
    },
    30000
  );

  it(
    'enforces cross-tenant isolation: User from Workspace B cannot access or modify Workspace A policy',
    async () => {
      const userA = await principalRepo.create({
        email: `alice-pol-${testRunId}@example.com`,
        displayName: 'Alice Policy',
      });

      const userB = await principalRepo.create({
        email: `bob-pol-${testRunId}@example.com`,
        displayName: 'Bob Policy',
      });

      const wsA = await workspaceRepo.create({
        name: `Alice WS ${testRunId}`,
        type: 'BUSINESS',
        createdBy: userA.id,
      });

      const wsB = await workspaceRepo.create({
        name: `Bob WS ${testRunId}`,
        type: 'BUSINESS',
        createdBy: userB.id,
      });

      // User B cannot view Workspace A policy
      await expect(
        policyUseCases.getActivePolicy(userB.id, wsA.id)
      ).rejects.toThrowError(/You are not a member of this workspace/);

      // User B cannot update Workspace A policy
      await expect(
        policyUseCases.createAndActivateVersion(userB.id, wsA.id, {
          name: 'Malicious Injected Policy',
          currency: 'USD',
          maxTransactionAmount: 99999900n,
          monthlyBudgetCap: 99999900n,
        })
      ).rejects.toThrowError(/You are not a member of this workspace/);
    },
    30000
  );

  it(
    'evaluates proposals authoritatively from database, proving client cannot inject policy',
    async () => {
      const admin = await principalRepo.create({
        email: `eval-admin-${testRunId}@example.com`,
        displayName: 'Evaluation Admin',
      });

      const ws = await workspaceRepo.create({
        name: `Evaluation WS ${testRunId}`,
        type: 'BUSINESS',
        createdBy: admin.id,
      });

      // Default policy has $500.00 cap (50000n minor units)
      // Evaluate proposal for $150.00 -> Approved
      const eval1 = await policyUseCases.evaluateProposal(admin.id, ws.id, {
        proposedAmount: 15000n,
        proposedCurrency: 'USD',
        merchantName: 'Trusted Vendor Inc',
      });

      expect(eval1.passed).toBe(true);
      expect(eval1.status).toBe('APPROVED');
      expect(eval1.evaluatedPolicyVersion).toBe(1);

      // Evaluate proposal for $600.00 -> Rejected by database policy ($500.00 cap)
      const eval2 = await policyUseCases.evaluateProposal(admin.id, ws.id, {
        proposedAmount: 60000n,
        proposedCurrency: 'USD',
        merchantName: 'Trusted Vendor Inc',
      });

      expect(eval2.passed).toBe(false);
      expect(eval2.status).toBe('REJECTED');
      expect(eval2.reasons).toContain('EXCEEDS_TRANSACTION_CAP');
      expect(eval2.evaluatedPolicyVersion).toBe(1);
    },
    30000
  );
});

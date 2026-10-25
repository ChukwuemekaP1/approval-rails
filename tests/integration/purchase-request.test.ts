import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { purchaseRepo } from '@/infrastructure/repositories/purchase-repository';
import { purchaseUseCases } from '@/application/purchase/purchase-use-cases';

describe('Purchase Request & Catalog Database Integration (PostgreSQL)', () => {
  const testRunId = crypto.randomUUID().slice(0, 8);

  it(
    'creates a durable purchase request and persists research candidates & summary',
    async () => {
      // 1. Create principal and workspace
      const user = await principalRepo.create({
        email: `buyer-${testRunId}@example.com`,
        displayName: 'Purchase Buyer',
      });

      const ws = await workspaceRepo.create({
        name: `Procurement WS ${testRunId}`,
        type: 'BUSINESS',
        createdBy: user.id,
      });

      // 2. Create purchase request
      const created = await purchaseUseCases.createRequest(
        user.id,
        ws.id,
        {
          intent: 'Ergonomic task chair for new engineering hire',
          budgetMinor: 30000n, // $300.00
          currency: 'USD',
          category: 'Furniture',
          preferredMerchant: 'OfficePro',
        },
        `corr-${testRunId}`
      );

      expect(created.id).toBeDefined();
      expect(created.status).toBe('DRAFT');
      expect(created.budget).toBe('300.00');
      expect(created.currency).toBe('USD');

      // 3. Execute research workflow using deterministic fixture provider
      const researched = await purchaseUseCases.executeResearch(user.id, ws.id, created.id, 'fixture');

      expect(researched.status).toBe('COMPLETED');
      expect(researched.candidates.length).toBeGreaterThan(0);
      expect(researched.summary).toBeDefined();
      expect(researched.summary?.summaryMarkdown).toBeDefined();

      // Verify candidate details
      const firstCandidate = researched.candidates[0];
      expect(firstCandidate.merchant).toBeDefined();
      expect(firstCandidate.sourceUrl).toMatch(/^https?:\/\//);
      expect(firstCandidate.price).toBeDefined();

      // 4. Durability check: Reload directly from database
      const reloaded = await purchaseUseCases.getRequestDetails(user.id, ws.id, created.id);
      expect(reloaded.id).toBe(created.id);
      expect(reloaded.status).toBe('COMPLETED');
      expect(reloaded.candidates).toHaveLength(researched.candidates.length);
      expect(reloaded.summary?.recommendedCandidateId).toBe(researched.summary?.recommendedCandidateId);
    },
    60000
  );

  it(
    'enforces multi-tenant isolation: User from Workspace B cannot access Workspace A purchase request',
    async () => {
      const userA = await principalRepo.create({
        email: `buyerA-${testRunId}@example.com`,
        displayName: 'Buyer A',
      });

      const userB = await principalRepo.create({
        email: `buyerB-${testRunId}@example.com`,
        displayName: 'Buyer B',
      });

      const wsA = await workspaceRepo.create({
        name: `Workspace A ${testRunId}`,
        type: 'BUSINESS',
        createdBy: userA.id,
      });

      const wsB = await workspaceRepo.create({
        name: `Workspace B ${testRunId}`,
        type: 'BUSINESS',
        createdBy: userB.id,
      });

      // User A creates request in Workspace A
      const reqA = await purchaseUseCases.createRequest(
        userA.id,
        wsA.id,
        {
          intent: 'Confidential corporate laptops',
          currency: 'USD',
        },
        `corrA-${testRunId}`
      );

      // User B attempts to access Workspace A request -> Denied
      await expect(
        purchaseUseCases.getRequestDetails(userB.id, wsA.id, reqA.id)
      ).rejects.toThrowError(/You are not a member of this workspace/);

      // User B attempts to trigger research on Workspace A request -> Denied
      await expect(
        purchaseUseCases.executeResearch(userB.id, wsA.id, reqA.id)
      ).rejects.toThrowError(/You are not a member of this workspace/);

      // User B querying through Workspace B cannot find request A -> 404
      await expect(
        purchaseUseCases.getRequestDetails(userB.id, wsB.id, reqA.id)
      ).rejects.toThrowError(/Purchase request not found/);
    },
    30000
  );
});

import { describe, it, expect, vi } from 'vitest';
import crypto from 'crypto';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { policyRepo } from '@/infrastructure/repositories/policy-repository';
import { purchaseUseCases } from '@/application/purchase/purchase-use-cases';
import { proposalUseCases } from '@/application/proposal/proposal-use-cases';
import { passkeyRepo } from '@/infrastructure/repositories/passkey-repository';
import { webAuthnAdapter } from '@/infrastructure/auth/webauthn-adapter';

describe('Proposal & Mandate Lifecycle Database Integration (PostgreSQL)', () => {
  const testRunId = crypto.randomUUID().slice(0, 8);

  it(
    'executes full research-to-proposal-to-sealing-to-authorization lifecycle',
    async () => {
      // 1. Create User and Workspace
      const user = await principalRepo.create({
        email: `mandate-user-${testRunId}@example.com`,
        displayName: 'Mandate User',
      });

      const ws = await workspaceRepo.create({
        name: `Mandate WS ${testRunId}`,
        type: 'BUSINESS',
        createdBy: user.id,
      });

      // 2. Configure authoritative active policy for workspace
      await policyRepo.createAndActivate(
        ws.id,
        {
          name: 'Standard Procurement Policy',
          currency: 'USD',
          maxTransactionAmount: 100000n, // $1,000.00
          monthlyBudgetCap: 500000n, // $5,000.00
          requireAdminAbove: 50000n, // $500.00
          allowedCategories: ['Office', 'Furniture', 'Hardware'],
          blockedMerchants: ['FraudulentVendor'],
        },
        user.id
      );

      // 3. Create purchase request and populate catalog candidates
      const purchaseReq = await purchaseUseCases.createRequest(
        user.id,
        ws.id,
        {
          intent: 'Keychron wireless mechanical keyboard',
          budgetMinor: 25000n,
          currency: 'USD',
          category: 'Hardware',
        },
        `corr-prop-${testRunId}`
      );

      const researched = await purchaseUseCases.executeResearch(
        user.id,
        ws.id,
        purchaseReq.id,
        'fixture'
      );
      expect(researched.candidates.length).toBeGreaterThan(0);
      const chosenCandidate = researched.candidates[0];

      // 4. Create proposal from chosen candidate
      const proposal = await proposalUseCases.createProposal({
        workspaceId: ws.id,
        requesterId: user.id,
        sourceRequestId: purchaseReq.id,
        items: [{ candidateId: chosenCandidate.id, quantity: 1 }],
      });

      expect(proposal.id).toBeDefined();
      expect(proposal.status).toBe('NEEDS_REVIEW');
      expect(proposal.merchant).toBe(chosenCandidate.merchant);
      expect(proposal.currency).toBe('USD');
      expect(proposal.totalAmountMinor).toBe(BigInt(chosenCandidate.priceMinor!));
      expect(proposal.termsHash).toMatch(/^[a-f0-9]{64}$/);
      expect(proposal.policyEvaluation.passed).toBe(true);

      const initialHash = proposal.termsHash;

      // 5. Revise basket: increment quantity to 2
      const revised = await proposalUseCases.reviseBasket(
        proposal.id,
        ws.id,
        user.id,
        [{ candidateId: chosenCandidate.id, quantity: 2 }]
      );

      expect(revised.items[0].quantity).toBe(2);
      expect(revised.totalAmountMinor).toBe(BigInt(chosenCandidate.priceMinor!) * 2n);
      expect(revised.termsHash).not.toBe(initialHash); // Digest changed!
      expect(revised.status).toBe('NEEDS_REVIEW');

      // 6. Seal proposal (locks terms)
      const sealed = await proposalUseCases.sealProposal(proposal.id, ws.id, user.id);
      expect(sealed.status).toBe('SEALED');

      // 7. Verify modifying a SEALED proposal is rejected
      await expect(
        proposalUseCases.reviseBasket(proposal.id, ws.id, user.id, [
          { candidateId: chosenCandidate.id, quantity: 3 },
        ])
      ).rejects.toThrow(/Cannot modify proposal in status SEALED/);

      // 8. Register a test passkey for user
      const credentialId = `cred-${testRunId}`;
      await passkeyRepo.create({
        principalId: user.id,
        credentialId,
        publicKey: Buffer.from('mock-public-key').toString('base64url'),
        counter: 0,
        deviceType: 'singleDevice',
        backedUp: false,
      });

      // 9. Generate WebAuthn challenge for authorization
      const authOptions = await proposalUseCases.generateAuthorizationOptions(
        proposal.id,
        ws.id,
        user.id
      );
      expect(authOptions.challenge).toBeDefined();

      // 10. Mock WebAuthn adapter verification
      const verifySpy = vi.spyOn(webAuthnAdapter, 'verifyAuthentication').mockResolvedValueOnce({
        verified: true,
        authenticationInfo: {
          newCounter: 1,
          credentialID: credentialId,
          credentialPublicKey: new Uint8Array(),
          credentialDeviceType: 'singleDevice',
          credentialBackedUp: false,
          origin: 'http://localhost:3000',
          rpID: 'localhost',
          userVerified: true,
        },
      } as any);

      // 11. Complete hardware authorization
      const authorized = await proposalUseCases.authorizeProposal(
        proposal.id,
        ws.id,
        user.id,
        {
          id: credentialId,
          rawId: credentialId,
          response: {
            clientDataJSON: Buffer.from('{}').toString('base64url'),
            authenticatorData: Buffer.from('{}').toString('base64url'),
            signature: Buffer.from('sig').toString('base64url'),
          },
          type: 'public-key',
          clientExtensionResults: {},
        }
      );

      expect(authorized.status).toBe('AUTHORIZED');
      expect(authorized.authorizedBy).toBe(user.id);
      expect(authorized.authorizedAt).toBeDefined();

      verifySpy.mockRestore();
    },
    60000
  );

  it(
    'enforces multi-tenant isolation: User from Workspace B cannot access or authorize Workspace A proposal',
    async () => {
      const userA = await principalRepo.create({
        email: `alice-prop-${testRunId}@example.com`,
        displayName: 'Alice Procurement',
      });
      const wsA = await workspaceRepo.create({
        name: `Alice Corp ${testRunId}`,
        type: 'BUSINESS',
        createdBy: userA.id,
      });

      await policyRepo.createAndActivate(
        wsA.id,
        {
          name: 'Alice Policy',
          currency: 'USD',
          maxTransactionAmount: 50000n,
          monthlyBudgetCap: 200000n,
        },
        userA.id
      );

      const reqA = await purchaseUseCases.createRequest(
        userA.id,
        wsA.id,
        { intent: 'Standing desk', budgetMinor: 40000n, currency: 'USD' },
        `corr-alice-${testRunId}`
      );
      const resA = await purchaseUseCases.executeResearch(userA.id, wsA.id, reqA.id, 'fixture');
      const propA = await proposalUseCases.createProposal({
        workspaceId: wsA.id,
        requesterId: userA.id,
        sourceRequestId: reqA.id,
        items: [{ candidateId: resA.candidates[0].id, quantity: 1 }],
      });

      const userB = await principalRepo.create({
        email: `bob-prop-${testRunId}@example.com`,
        displayName: 'Bob Intruder',
      });

      // User B attempts to access Workspace A's proposal
      await expect(
        proposalUseCases.getProposal(propA.id, wsA.id, userB.id)
      ).rejects.toThrow();

      // User B attempts to seal Workspace A's proposal
      await expect(
        proposalUseCases.sealProposal(propA.id, wsA.id, userB.id)
      ).rejects.toThrow();
    },
    60000
  );
});

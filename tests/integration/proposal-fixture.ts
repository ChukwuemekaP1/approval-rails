import crypto from 'crypto';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { policyRepo } from '@/infrastructure/repositories/policy-repository';
import { purchaseRepo } from '@/infrastructure/repositories/purchase-repository';
import { passkeyRepo } from '@/infrastructure/repositories/passkey-repository';

export async function setupProposalSecurityFixture(testRunId: string) {
  const admin = await principalRepo.create({
    email: `admin-sec-${testRunId}-${crypto.randomUUID().slice(0, 4)}@example.com`,
    displayName: 'Admin User',
  });

  const member = await principalRepo.create({
    email: `member-sec-${testRunId}-${crypto.randomUUID().slice(0, 4)}@example.com`,
    displayName: 'Member User',
  });

  const ws = await workspaceRepo.create({
    name: `Security WS ${testRunId}`,
    type: 'BUSINESS',
    createdBy: admin.id,
  });

  await workspaceRepo.addMember(ws.id, member.id, 'MEMBER');

  const activePolicy = await policyRepo.createAndActivate(
    ws.id,
    {
      name: 'Strict Procurement Policy',
      currency: 'USD',
      maxTransactionAmount: 100000n, // $1,000.00
      monthlyBudgetCap: 500000n, // $5,000.00
      requireAdminAbove: 20000n, // $200.00
      allowedCategories: ['Hardware'],
      blockedMerchants: ['BadVendor'],
    },
    admin.id
  );

  const purchaseReq = await purchaseRepo.create({
    workspaceId: ws.id,
    createdBy: member.id,
    correlationId: `corr-sec-${testRunId}-${crypto.randomUUID().slice(0, 4)}`,
    intent: 'Hardware item',
    budgetMinor: 50000n,
    currency: 'USD',
    category: 'Hardware',
  });

  const candidateSnapshot = {
    id: crypto.randomUUID(),
    purchaseRequestId: purchaseReq.id,
    providerId: 'fixture' as const,
    externalId: 'ext-sec-item-1',
    merchant: 'HardwareDirect',
    title: 'Precision Mechanical Hardware Component',
    description: 'Industrial grade component',
    sourceUrl: 'https://hardware.example.com/item-1',
    priceMinor: 24900n,
    currency: 'USD' as const,
    availabilityStatus: 'IN_STOCK' as const,
    observedAt: new Date(),
  };

  await purchaseRepo.saveResearchResults(
    purchaseReq.id,
    ws.id,
    [candidateSnapshot],
    {
      summaryMarkdown: 'Summary of candidates',
      recommendedCandidateId: candidateSnapshot.id,
      recommendationReason: 'Best fit',
      comparisons: [],
      generatedAt: new Date(),
    }
  );

  const candidates = await purchaseRepo.getCandidates(purchaseReq.id);
  const candidate = candidates[0];

  const passkey = await passkeyRepo.create({
    principalId: admin.id,
    credentialId: `cred-admin-${crypto.randomUUID()}`,
    publicKey: Buffer.from('mock-admin-key').toString('base64url'),
    counter: 0,
    deviceType: 'singleDevice',
    backedUp: false,
  });

  return { admin, member, ws, activePolicy, purchaseReq, candidate, passkey };
}

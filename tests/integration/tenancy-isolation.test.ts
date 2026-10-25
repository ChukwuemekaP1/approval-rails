import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { challengeRepo } from '@/infrastructure/repositories/challenge-repository';
import { authorizationService } from '@/application/auth/authorization-service';

describe('Tenancy & Authorization Database Integration (PostgreSQL)', () => {
  const testRunId = crypto.randomUUID().slice(0, 8);

  it(
    'proves multi-tenant isolation: User B cannot access User A workspace',
    async () => {
    // 1. Create User A and User B
    const userA = await principalRepo.create({
      email: `alice-${testRunId}@example.com`,
      displayName: 'Alice Invariant',
    });

    const userB = await principalRepo.create({
      email: `bob-${testRunId}@example.com`,
      displayName: 'Bob Invariant',
    });

    // 2. User A creates Workspace A
    const workspaceA = await workspaceRepo.create({
      name: `Alice Corp ${testRunId}`,
      type: 'BUSINESS',
      createdBy: userA.id,
    });

    // 3. User B creates Workspace B
    const workspaceB = await workspaceRepo.create({
      name: `Bob Enterprises ${testRunId}`,
      type: 'BUSINESS',
      createdBy: userB.id,
    });

    // Verify User A is ADMIN in Workspace A
    const memberA = await workspaceRepo.getMember(workspaceA.id, userA.id);
    expect(memberA).toBeDefined();
    expect(memberA?.role).toBe('ADMIN');

    // Verify User B is ADMIN in Workspace B
    const memberB = await workspaceRepo.getMember(workspaceB.id, userB.id);
    expect(memberB).toBeDefined();
    expect(memberB?.role).toBe('ADMIN');

    // 4. Cross-tenant check: User B attempts to access Workspace A -> MUST be denied with 403
    await expect(
      authorizationService.authorizeWorkspace(userB.id, workspaceA.id)
    ).rejects.toThrowError(/You are not a member of this workspace/);

    // 5. Cross-tenant check: User A attempts to access Workspace B -> MUST be denied with 403
    await expect(
      authorizationService.authorizeWorkspace(userA.id, workspaceB.id)
    ).rejects.toThrowError(/You are not a member of this workspace/);
  }, 30000);

  it('enforces database-level unique constraint on (workspace_id, principal_id)', async () => {
    const user = await principalRepo.create({
      email: `unique-test-${testRunId}@example.com`,
      displayName: 'Unique Tester',
    });

    const ws = await workspaceRepo.create({
      name: `Unique WS ${testRunId}`,
      type: 'PERSONAL',
      createdBy: user.id,
    });

    // User is already added upon creation. Attempting to add duplicate membership must fail
    await expect(
      workspaceRepo.addMember(ws.id, user.id, 'MEMBER')
    ).rejects.toThrow();
  });

  it('enforces single-use expiring challenge semantics in database', async () => {
    const challengeStr = crypto.randomUUID();

    // Create challenge
    const created = await challengeRepo.create({
      challenge: challengeStr,
      flowType: 'AUTHENTICATION',
      expiresAt: new Date(Date.now() + 60000), // 1 min future
    });

    // 1. Finding unconsumed challenge succeeds
    const found = await challengeRepo.findValidChallenge(challengeStr, 'AUTHENTICATION');
    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.used).toBe(false);

    // 2. Mark challenge used
    await challengeRepo.markUsed(created.id);

    // 3. Subsequent lookup fails because challenge is consumed
    const consumedLookup = await challengeRepo.findValidChallenge(
      challengeStr,
      'AUTHENTICATION'
    );
    expect(consumedLookup).toBeNull();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/onboarding/complete/route';
import * as sessionModule from '@/infrastructure/auth/session-cookie';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { policyUseCases } from '@/application/policy/policy-use-cases';
import { invitationRepo } from '@/infrastructure/repositories/invitation-repository';

describe('Onboarding Complete API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects unauthenticated requests with 401', async () => {
    vi.spyOn(sessionModule, 'getSessionTokenFromRequest').mockReturnValue(null);
    const req = new NextRequest('http://localhost:3000/api/v1/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify({
        workspaceType: 'PERSONAL',
        workspaceName: 'My Space',
        currency: 'USD',
        maxTransactionAmount: '500.00',
        monthlyBudgetCap: '2000.00',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('configures personal workspace with limits converted to minor units', async () => {
    vi.spyOn(sessionModule, 'getSessionTokenFromRequest').mockReturnValue('token-123');
    vi.spyOn(sessionModule, 'resolveSession').mockResolvedValue({
      session: { id: 'sess-1' } as any,
      principal: { id: 'user-1', email: 'alex@example.com', displayName: 'Alex' } as any,
      activeWorkspace: { id: 'ws-1', name: 'Old Space', type: 'PERSONAL' } as any,
      memberships: [],
    });

    vi.spyOn(workspaceRepo, 'update').mockResolvedValue({ id: 'ws-1', name: 'Alex Purchases', type: 'PERSONAL' } as any);
    const policySpy = vi.spyOn(policyUseCases, 'createAndActivateVersion').mockResolvedValue({} as any);

    const req = new NextRequest('http://localhost:3000/api/v1/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify({
        workspaceType: 'PERSONAL',
        workspaceName: 'Alex Purchases',
        currency: 'USD',
        maxTransactionAmount: '1000.00',
        monthlyBudgetCap: '5000.00',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.redirectTo).toBe('/app');

    expect(policySpy).toHaveBeenCalledWith('user-1', 'ws-1', expect.objectContaining({
      currency: 'USD',
      maxTransactionAmount: 100000n, // $1000.00 = 100000 minor units
      monthlyBudgetCap: 500000n,     // $5000.00 = 500000 minor units
    }));
  });

  it('configures business workspace and invites manager when email provided', async () => {
    vi.spyOn(sessionModule, 'getSessionTokenFromRequest').mockReturnValue('token-123');
    vi.spyOn(sessionModule, 'resolveSession').mockResolvedValue({
      session: { id: 'sess-1' } as any,
      principal: { id: 'user-1', email: 'owner@acme.com', displayName: 'Owner' } as any,
      activeWorkspace: { id: 'ws-2', name: 'Acme', type: 'BUSINESS' } as any,
      memberships: [],
    });

    vi.spyOn(workspaceRepo, 'update').mockResolvedValue({ id: 'ws-2', name: 'Acme Corp', type: 'BUSINESS' } as any);
    vi.spyOn(policyUseCases, 'createAndActivateVersion').mockResolvedValue({} as any);
    const inviteSpy = vi.spyOn(invitationRepo, 'create').mockResolvedValue({} as any);

    const req = new NextRequest('http://localhost:3000/api/v1/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify({
        workspaceType: 'BUSINESS',
        workspaceName: 'Acme Corp',
        currency: 'USD',
        maxTransactionAmount: '10000.00',
        monthlyBudgetCap: '50000.00',
        managerEmail: 'manager@acme.com',
        requireAdminAbove: '2000.00',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(inviteSpy).toHaveBeenCalledWith(expect.objectContaining({
      workspaceId: 'ws-2',
      email: 'manager@acme.com',
      role: 'MANAGER',
    }));
  });
});

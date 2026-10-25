import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as pinLoginHandler } from '@/app/api/v1/auth/pin-login/route';

vi.mock('@/infrastructure/repositories/principal-repository', () => ({
  principalRepo: {
    findByEmail: vi.fn().mockResolvedValue({ id: 'p1', email: 'alice@test.com', displayName: 'Alice' }),
    create: vi.fn(),
  },
}));

vi.mock('@/infrastructure/repositories/workspace-repository', () => ({
  workspaceRepo: {
    listForPrincipal: vi.fn().mockResolvedValue([
      { workspace: { id: 'ws1', name: "Alice's Workspace" }, role: 'ADMIN' },
    ]),
    create: vi.fn(),
  },
}));

vi.mock('@/infrastructure/repositories/session-repository', () => ({
  sessionRepo: {
    create: vi.fn().mockResolvedValue({
      id: 'sess1',
      sessionToken: 'test-session-token',
      principalId: 'p1',
      activeWorkspaceId: 'ws1',
    }),
  },
}));

describe('PIN Fallback Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects login when PIN is incorrect', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/pin-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'alice@test.com', pin: '000000' }),
    });

    const res = await pinLoginHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.title).toBe('BAD_REQUEST');
  });

  it('authenticates user and sets session cookie when PIN matches', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/pin-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'alice@test.com', pin: '123456' }),
    });

    const res = await pinLoginHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.principal.email).toBe('alice@test.com');
    expect(res.headers.get('set-cookie')).toContain('approve_rail_session');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as pinLoginHandler } from '@/app/api/v1/auth/pin-login/route';
import { hashPassword } from '@/infrastructure/auth/password';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';

vi.mock('@/infrastructure/repositories/principal-repository', () => ({
  principalRepo: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    setPasswordHash: vi.fn(),
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

describe('PIN and Password Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects login when password does not match stored hash', async () => {
    vi.mocked(principalRepo.findByEmail).mockResolvedValueOnce({
      id: 'p1',
      email: 'alice@test.com',
      displayName: 'Alice',
      passwordHash: hashPassword('custom-secret-password'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest('http://localhost:3000/api/v1/auth/pin-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'alice@test.com', pin: 'wrong-pass' }),
    });

    const res = await pinLoginHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.title).toBe('BAD_REQUEST');
  });

  it('authenticates user with their custom password matching stored hash', async () => {
    vi.mocked(principalRepo.findByEmail).mockResolvedValueOnce({
      id: 'p1',
      email: 'alice@test.com',
      displayName: 'Alice',
      passwordHash: hashPassword('my-strong-password-2026'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest('http://localhost:3000/api/v1/auth/pin-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'alice@test.com', pin: 'my-strong-password-2026' }),
    });

    const res = await pinLoginHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(res.headers.get('set-cookie')).toContain('approve_rail_session');
  });

  it('creates an account when user signs up with custom password', async () => {
    vi.mocked(principalRepo.findByEmail).mockResolvedValueOnce(null);
    vi.mocked(principalRepo.create).mockResolvedValueOnce({
      id: 'p2',
      email: 'bob@test.com',
      displayName: 'Bob Smith',
      passwordHash: hashPassword('bobs-secret-pin'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest('http://localhost:3000/api/v1/auth/pin-login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'bob@test.com',
        displayName: 'Bob Smith',
        pin: 'bobs-secret-pin',
        isSignUp: true,
      }),
    });

    const res = await pinLoginHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(principalRepo.create).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthorizationService } from '@/application/auth/authorization-service';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';

vi.mock('@/infrastructure/repositories/workspace-repository');

describe('AuthorizationService Multi-Tenant Checks', () => {
  let authService: AuthorizationService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthorizationService();
  });

  it('rejects unauthenticated requests (missing principalId) with 401 Unauthorized', async () => {
    await expect(authService.authorizeWorkspace('', 'ws-123')).rejects.toThrowError(
      /Authentication required/
    );
  });

  it('rejects requests with missing workspaceId with 400 Bad Request', async () => {
    await expect(authService.authorizeWorkspace('user-1', '')).rejects.toThrowError(
      /Workspace ID is required/
    );
  });

  it('returns 404 Not Found when workspace does not exist', async () => {
    vi.spyOn(workspaceRepo, 'findById').mockResolvedValue(null);

    await expect(authService.authorizeWorkspace('user-1', 'nonexistent-ws')).rejects.toThrowError(
      /Workspace not found/
    );
  });

  it('strictly denies User B attempting to access User A workspace (403 Forbidden)', async () => {
    vi.spyOn(workspaceRepo, 'findById').mockResolvedValue({
      id: 'workspace-a',
      name: "User A's Workspace",
      type: 'PERSONAL',
      createdBy: 'user-a',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // User B is NOT a member
    vi.spyOn(workspaceRepo, 'getMember').mockResolvedValue(null);

    await expect(
      authService.authorizeWorkspace('user-b', 'workspace-a')
    ).rejects.toThrowError(/You are not a member of this workspace/);
  });

  it('grants access when user is a valid workspace member', async () => {
    const mockWs = {
      id: 'workspace-a',
      name: "User A's Workspace",
      type: 'BUSINESS' as const,
      createdBy: 'user-a',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(workspaceRepo, 'findById').mockResolvedValue(mockWs);
    vi.spyOn(workspaceRepo, 'getMember').mockResolvedValue({
      id: 'mem-1',
      workspaceId: 'workspace-a',
      principalId: 'user-a',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const context = await authService.authorizeWorkspace('user-a', 'workspace-a');
    expect(context.workspace.id).toBe('workspace-a');
    expect(context.role).toBe('ADMIN');
  });

  it('denies MEMBER role when ADMIN role is strictly required', async () => {
    vi.spyOn(workspaceRepo, 'findById').mockResolvedValue({
      id: 'workspace-a',
      name: "Company Workspace",
      type: 'BUSINESS',
      createdBy: 'user-admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.spyOn(workspaceRepo, 'getMember').mockResolvedValue({
      id: 'mem-2',
      workspaceId: 'workspace-a',
      principalId: 'user-regular',
      role: 'MEMBER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      authService.authorizeWorkspace('user-regular', 'workspace-a', 'ADMIN')
    ).rejects.toThrowError(/Administrator privileges required/);
  });

  it('strictly isolates resource access: User B cannot access User A resource', async () => {
    vi.spyOn(workspaceRepo, 'findById').mockResolvedValue({
      id: 'shared-ws',
      name: 'Shared Workspace',
      type: 'BUSINESS',
      createdBy: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.spyOn(workspaceRepo, 'getMember').mockResolvedValue({
      id: 'mem-3',
      workspaceId: 'shared-ws',
      principalId: 'user-b',
      role: 'MEMBER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Resource belongs to user-a; user-b is regular member -> rejected!
    await expect(
      authService.authorizeResource('user-b', 'shared-ws', 'user-a')
    ).rejects.toThrowError(/You do not own this resource/);
  });
});

import { ApiError } from '@/infrastructure/errors/api-error';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { Workspace, WorkspaceRole } from '@/domain/identity/types';

export interface AuthorizedWorkspaceContext {
  workspace: Workspace;
  role: WorkspaceRole;
}

export class AuthorizationService {
  /**
   * Verifies that the authenticated principal is an authorized member of the target workspace.
   * If requiredRole is specified (e.g. 'ADMIN'), verifies that the member holds that role.
   */
  async authorizeWorkspace(
    principalId: string,
    workspaceId: string,
    requiredRole?: WorkspaceRole
  ): Promise<AuthorizedWorkspaceContext> {
    if (!principalId) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!workspaceId) {
      throw ApiError.badRequest('Workspace ID is required');
    }

    const workspace = await workspaceRepo.findById(workspaceId);
    if (!workspace) {
      throw ApiError.notFound('Workspace not found');
    }

    const membership = await workspaceRepo.getMember(workspaceId, principalId);
    if (!membership) {
      throw ApiError.forbidden('You are not a member of this workspace');
    }

    if (requiredRole && requiredRole === 'ADMIN' && membership.role !== 'ADMIN') {
      throw ApiError.forbidden('Administrator privileges required in this workspace');
    }

    return {
      workspace,
      role: membership.role,
    };
  }

  /**
   * Verifies that the principal has ownership over a target resource within the given workspace,
   * or has administrative override privileges for the workspace.
   */
  async authorizeResource(
    principalId: string,
    workspaceId: string,
    resourceOwnerPrincipalId: string
  ): Promise<AuthorizedWorkspaceContext> {
    const authContext = await this.authorizeWorkspace(principalId, workspaceId);

    // If caller is the resource owner, access is granted
    if (principalId === resourceOwnerPrincipalId) {
      return authContext;
    }

    // Admins have oversight in their workspace
    if (authContext.role === 'ADMIN') {
      return authContext;
    }

    throw ApiError.forbidden('You do not own this resource');
  }
}

export const authorizationService = new AuthorizationService();

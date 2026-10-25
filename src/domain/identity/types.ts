export type WorkspaceRole = 'OWNER' | 'MANAGER' | 'PURCHASER' | 'ADMIN' | 'MEMBER';
export type WorkspaceType = 'PERSONAL' | 'BUSINESS';

export type AuthFlowType = 'REGISTRATION' | 'AUTHENTICATION' | 'MANDATE_AUTHORIZATION';

export interface Principal {
  id: string;
  email: string;
  displayName: string;
  passwordHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Passkey {
  id: string;
  principalId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceType: string;
  backedUp: boolean;
  transports?: string[] | null;
  createdAt: Date;
  lastUsedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  principalId: string;
  role: WorkspaceRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  sessionToken: string;
  principalId: string;
  activeWorkspaceId: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
}

export interface AuthChallenge {
  id: string;
  challenge: string;
  flowType: AuthFlowType;
  principalId?: string | null;
  email?: string | null;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface SessionContext {
  principal: Principal;
  session: Session;
  activeWorkspace: Workspace | null;
  memberships: Array<{
    workspace: Workspace;
    role: WorkspaceRole;
  }>;
}

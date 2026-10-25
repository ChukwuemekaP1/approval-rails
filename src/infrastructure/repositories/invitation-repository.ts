import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import { getDb } from '../db';
import { workspaceInvitations, workspaces, principals } from '../db/schema';
import { WorkspaceRole } from '@/domain/identity/types';

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  invitedBy: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export class InvitationRepository {
  async create(data: {
    workspaceId: string;
    email: string;
    role: WorkspaceRole;
    invitedBy: string;
    expiresInHours?: number;
  }): Promise<WorkspaceInvitation> {
    const db = getDb();
    const token = crypto.randomBytes(32).toString('hex');
    const hours = data.expiresInHours || 168; // 7 days default
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000);

    const rows = await db
      .insert(workspaceInvitations)
      .values({
        workspaceId: data.workspaceId,
        email: data.email.toLowerCase().trim(),
        role: data.role,
        token,
        invitedBy: data.invitedBy,
        expiresAt,
      })
      .returning();

    return rows[0] as unknown as WorkspaceInvitation;
  }

  async findByToken(token: string): Promise<{
    invitation: WorkspaceInvitation;
    workspace: { id: string; name: string; type: string };
    inviter: { id: string; displayName: string; email: string };
  } | null> {
    const db = getDb();
    const rows = await db
      .select({
        invitation: workspaceInvitations,
        workspace: { id: workspaces.id, name: workspaces.name, type: workspaces.type },
        inviter: { id: principals.id, displayName: principals.displayName, email: principals.email },
      })
      .from(workspaceInvitations)
      .innerJoin(workspaces, eq(workspaceInvitations.workspaceId, workspaces.id))
      .innerJoin(principals, eq(workspaceInvitations.invitedBy, principals.id))
      .where(eq(workspaceInvitations.token, token))
      .limit(1);

    if (rows.length === 0) return null;
    return rows[0] as unknown as {
      invitation: WorkspaceInvitation;
      workspace: { id: string; name: string; type: string };
      inviter: { id: string; displayName: string; email: string };
    };
  }

  async listPending(workspaceId: string): Promise<WorkspaceInvitation[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(workspaceInvitations)
      .where(and(eq(workspaceInvitations.workspaceId, workspaceId)))
      .orderBy(workspaceInvitations.createdAt);

    return rows as unknown as WorkspaceInvitation[];
  }

  async markAccepted(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(workspaceInvitations)
      .set({ acceptedAt: new Date() })
      .where(eq(workspaceInvitations.id, id));
  }
}

export const invitationRepo = new InvitationRepository();

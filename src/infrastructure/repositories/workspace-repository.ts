import { eq, and } from 'drizzle-orm';
import { getDb } from '../db';
import { workspaces, workspaceMembers, principals } from '../db/schema';
import {
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceType,
  Principal,
} from '@/domain/identity/types';

export class WorkspaceRepository {
  async findById(workspaceId: string): Promise<Workspace | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    return (rows[0] as Workspace) || null;
  }

  async listForPrincipal(principalId: string): Promise<
    Array<{
      workspace: Workspace;
      role: WorkspaceRole;
    }>
  > {
    const db = getDb();
    const rows = await db
      .select({
        workspace: workspaces,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.principalId, principalId));

    return rows.map((r) => ({
      workspace: r.workspace as Workspace,
      role: r.role as WorkspaceRole,
    }));
  }

  async create(data: {
    name: string;
    type: WorkspaceType;
    createdBy: string;
  }): Promise<Workspace> {
    const db = getDb();
    const rows = await db
      .insert(workspaces)
      .values({
        name: data.name.trim(),
        type: data.type,
        createdBy: data.createdBy,
      })
      .returning();

    const created = rows[0] as Workspace;

    // Automatically make creator the workspace ADMIN
    await db.insert(workspaceMembers).values({
      workspaceId: created.id,
      principalId: data.createdBy,
      role: 'ADMIN',
    });

    return created;
  }

  async getMember(workspaceId: string, principalId: string): Promise<WorkspaceMember | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.principalId, principalId)
        )
      )
      .limit(1);

    return (rows[0] as WorkspaceMember) || null;
  }

  async addMember(
    workspaceId: string,
    principalId: string,
    role: WorkspaceRole
  ): Promise<WorkspaceMember> {
    const db = getDb();
    const rows = await db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        principalId,
        role,
      })
      .returning();

    return rows[0] as WorkspaceMember;
  }

  async listMembers(workspaceId: string): Promise<
    Array<{
      member: WorkspaceMember;
      principal: Principal;
    }>
  > {
    const db = getDb();
    const rows = await db
      .select({
        member: workspaceMembers,
        principal: principals,
      })
      .from(workspaceMembers)
      .innerJoin(principals, eq(workspaceMembers.principalId, principals.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    return rows.map((r) => ({
      member: r.member as WorkspaceMember,
      principal: r.principal as Principal,
    }));
  }
}

export const workspaceRepo = new WorkspaceRepository();

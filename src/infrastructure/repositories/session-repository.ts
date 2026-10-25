import { eq, and, isNull, gt } from 'drizzle-orm';
import { getDb } from '../db';
import { sessions } from '../db/schema';
import { Session } from '@/domain/identity/types';

export class SessionRepository {
  async create(data: {
    sessionToken: string;
    principalId: string;
    activeWorkspaceId?: string | null;
    expiresAt: Date;
    userAgent?: string | null;
    ipAddress?: string | null;
  }): Promise<Session> {
    const db = getDb();
    const rows = await db
      .insert(sessions)
      .values({
        sessionToken: data.sessionToken,
        principalId: data.principalId,
        activeWorkspaceId: data.activeWorkspaceId || null,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent || null,
        ipAddress: data.ipAddress || null,
      })
      .returning();

    return rows[0] as Session;
  }

  async findByToken(token: string): Promise<Session | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.sessionToken, token),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    return (rows[0] as Session) || null;
  }

  async updateActiveWorkspace(sessionId: string, workspaceId: string): Promise<void> {
    const db = getDb();
    await db
      .update(sessions)
      .set({ activeWorkspaceId: workspaceId })
      .where(eq(sessions.id, sessionId));
  }

  async revoke(sessionId: string): Promise<void> {
    const db = getDb();
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, sessionId));
  }

  async revokeAllForPrincipal(principalId: string): Promise<void> {
    const db = getDb();
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.principalId, principalId));
  }
}

export const sessionRepo = new SessionRepository();

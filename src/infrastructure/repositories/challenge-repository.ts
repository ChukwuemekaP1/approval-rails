import { eq, and, gt } from 'drizzle-orm';
import { getDb } from '../db';
import { authChallenges } from '../db/schema';
import { AuthChallenge, AuthFlowType } from '@/domain/identity/types';

export class ChallengeRepository {
  async create(data: {
    challenge: string;
    flowType: AuthFlowType;
    principalId?: string | null;
    email?: string | null;
    expiresAt: Date;
  }): Promise<AuthChallenge> {
    const db = getDb();
    const rows = await db
      .insert(authChallenges)
      .values({
        challenge: data.challenge,
        flowType: data.flowType,
        principalId: data.principalId || null,
        email: data.email ? data.email.toLowerCase().trim() : null,
        expiresAt: data.expiresAt,
        used: false,
      })
      .returning();

    return rows[0] as AuthChallenge;
  }

  async findValidChallenge(challenge: string, flowType: AuthFlowType): Promise<AuthChallenge | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(authChallenges)
      .where(
        and(
          eq(authChallenges.challenge, challenge),
          eq(authChallenges.flowType, flowType),
          eq(authChallenges.used, false),
          gt(authChallenges.expiresAt, new Date())
        )
      )
      .limit(1);

    return (rows[0] as AuthChallenge) || null;
  }

  async markUsed(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(authChallenges)
      .set({ used: true })
      .where(eq(authChallenges.id, id));
  }
}

export const challengeRepo = new ChallengeRepository();

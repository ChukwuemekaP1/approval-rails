import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { principals } from '../db/schema';
import { Principal } from '@/domain/identity/types';

export class PrincipalRepository {
  async findByEmail(email: string): Promise<Principal | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(principals)
      .where(eq(principals.email, email.toLowerCase().trim()))
      .limit(1);

    return (rows[0] as Principal) || null;
  }

  async findById(id: string): Promise<Principal | null> {
    const db = getDb();
    const rows = await db.select().from(principals).where(eq(principals.id, id)).limit(1);
    return (rows[0] as Principal) || null;
  }

  async create(data: { email: string; displayName: string; passwordHash?: string | null }): Promise<Principal> {
    const db = getDb();
    const rows = await db
      .insert(principals)
      .values({
        email: data.email.toLowerCase().trim(),
        displayName: data.displayName.trim(),
        passwordHash: data.passwordHash || null,
      })
      .returning();

    return rows[0] as Principal;
  }

  async setPasswordHash(id: string, passwordHash: string): Promise<void> {
    const db = getDb();
    await db
      .update(principals)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(principals.id, id));
  }
}

export const principalRepo = new PrincipalRepository();

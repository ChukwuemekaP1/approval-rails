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

  async create(data: { email: string; displayName: string }): Promise<Principal> {
    const db = getDb();
    const rows = await db
      .insert(principals)
      .values({
        email: data.email.toLowerCase().trim(),
        displayName: data.displayName.trim(),
      })
      .returning();

    return rows[0] as Principal;
  }
}

export const principalRepo = new PrincipalRepository();

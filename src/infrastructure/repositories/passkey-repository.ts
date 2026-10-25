import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { passkeys } from '../db/schema';
import { Passkey } from '@/domain/identity/types';

export class PasskeyRepository {
  async findByCredentialId(credentialId: string): Promise<Passkey | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(passkeys)
      .where(eq(passkeys.credentialId, credentialId))
      .limit(1);

    if (!rows[0]) return null;
    const row = rows[0];
    return {
      id: row.id,
      principalId: row.principalId,
      credentialId: row.credentialId,
      publicKey: row.publicKey,
      counter: Number(row.counter),
      deviceType: row.deviceType,
      backedUp: row.backedUp,
      transports: row.transports ? JSON.parse(row.transports) : null,
      createdAt: row.createdAt,
      lastUsedAt: row.lastUsedAt,
    };
  }

  async listByPrincipalId(principalId: string): Promise<Passkey[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(passkeys)
      .where(eq(passkeys.principalId, principalId));

    return rows.map((row) => ({
      id: row.id,
      principalId: row.principalId,
      credentialId: row.credentialId,
      publicKey: row.publicKey,
      counter: Number(row.counter),
      deviceType: row.deviceType,
      backedUp: row.backedUp,
      transports: row.transports ? JSON.parse(row.transports) : null,
      createdAt: row.createdAt,
      lastUsedAt: row.lastUsedAt,
    }));
  }

  async create(data: {
    principalId: string;
    credentialId: string;
    publicKey: string;
    counter: number;
    deviceType: string;
    backedUp: boolean;
    transports?: string[] | null;
  }): Promise<Passkey> {
    const db = getDb();
    const rows = await db
      .insert(passkeys)
      .values({
        principalId: data.principalId,
        credentialId: data.credentialId,
        publicKey: data.publicKey,
        counter: data.counter,
        deviceType: data.deviceType,
        backedUp: data.backedUp,
        transports: data.transports ? JSON.stringify(data.transports) : null,
      })
      .returning();

    const row = rows[0];
    return {
      id: row.id,
      principalId: row.principalId,
      credentialId: row.credentialId,
      publicKey: row.publicKey,
      counter: Number(row.counter),
      deviceType: row.deviceType,
      backedUp: row.backedUp,
      transports: row.transports ? JSON.parse(row.transports) : null,
      createdAt: row.createdAt,
      lastUsedAt: row.lastUsedAt,
    };
  }

  async updateCounter(credentialId: string, counter: number): Promise<void> {
    const db = getDb();
    await db
      .update(passkeys)
      .set({
        counter,
        lastUsedAt: new Date(),
      })
      .where(eq(passkeys.credentialId, credentialId));
  }
}

export const passkeyRepo = new PasskeyRepository();

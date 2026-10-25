import { desc, eq, and, sql } from 'drizzle-orm';
import { getDb } from '../db';
import { ledgerEntries } from '../db/schema';
import { LedgerPort, AppendEventParams } from '@/application/ledger/ledger-port';
import { LedgerEntry, LedgerFilter, EvidenceBundle, LedgerActor } from '@/domain/ledger/types';
import { canonicalizeEntry, computeSha256Hex, GENESIS_HASH } from '@/domain/ledger/canonicalize';
import { sanitizePayload } from '@/domain/ledger/redaction';
import { ApiError } from '../errors/api-error';

export class PostgresLedgerRepository implements LedgerPort {
  async appendEvent(params: AppendEventParams): Promise<LedgerEntry> {
    const db = getDb();
    const cleanPayload = sanitizePayload(params.payload);
    const timestamp = params.timestamp || new Date().toISOString();

    return await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${params.streamId}))`);

      const rows = await tx
        .select()
        .from(ledgerEntries)
        .where(eq(ledgerEntries.streamId, params.streamId))
        .orderBy(desc(ledgerEntries.sequence))
        .limit(1)
        .for('update');

      const latest = rows[0];
      const sequence = latest ? latest.sequence + 1 : 1;
      const prevHash = latest ? latest.hash : GENESIS_HASH;

      const canonicalJson = canonicalizeEntry({
        streamId: params.streamId,
        sequence,
        eventType: params.eventType,
        timestamp,
        actor: params.actor,
        payload: cleanPayload,
        prevHash,
      });

      const hash = await computeSha256Hex(canonicalJson);

      const inserted = await tx
        .insert(ledgerEntries)
        .values({
          workspaceId: params.workspaceId,
          streamId: params.streamId,
          correlationId: params.correlationId,
          sequence,
          eventType: params.eventType,
          actorKind: params.actor.kind,
          actorId: params.actor.id,
          actorName: params.actor.name || null,
          payload: cleanPayload,
          prevHash,
          hash,
          createdAt: new Date(timestamp),
        })
        .returning();

      return this.mapRow(inserted[0]);
    });
  }

  async listByWorkspace(workspaceId: string, filter?: LedgerFilter): Promise<LedgerEntry[]> {
    const db = getDb();
    const conditions = [eq(ledgerEntries.workspaceId, workspaceId)];

    if (filter?.streamId) conditions.push(eq(ledgerEntries.streamId, filter.streamId));
    if (filter?.correlationId) conditions.push(eq(ledgerEntries.correlationId, filter.correlationId));
    if (filter?.eventType) conditions.push(eq(ledgerEntries.eventType, filter.eventType));

    const rows = await db
      .select()
      .from(ledgerEntries)
      .where(and(...conditions))
      .orderBy(desc(ledgerEntries.createdAt))
      .limit(filter?.limit || 100)
      .offset(filter?.offset || 0);

    return rows.map((r) => this.mapRow(r));
  }

  async listByStream(streamId: string): Promise<LedgerEntry[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.streamId, streamId))
      .orderBy(ledgerEntries.sequence);

    return rows.map((r) => this.mapRow(r));
  }

  async exportEvidenceBundle(workspaceId: string, streamId: string): Promise<EvidenceBundle> {
    const events = await this.listByStream(streamId);
    if (events.length === 0) {
      throw ApiError.notFound('No ledger events found for this stream');
    }

    return {
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      workspaceId,
      streamId,
      correlationId: events[0].correlationId,
      totalEvents: events.length,
      headHash: events[events.length - 1].hash,
      events,
    };
  }

  private mapRow(row: any): LedgerEntry {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      streamId: row.streamId,
      correlationId: row.correlationId,
      sequence: row.sequence,
      eventType: row.eventType as any,
      actor: {
        kind: row.actorKind as any,
        id: row.actorId,
        name: row.actorName || undefined,
      },
      payload: row.payload as Record<string, unknown>,
      prevHash: row.prevHash,
      hash: row.hash,
      timestamp: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    };
  }
}

export const ledgerRepo = new PostgresLedgerRepository();

import { describe, it, expect, beforeAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { getDb } from '@/infrastructure/db';
import { ledgerEntries, workspaces, principals } from '@/infrastructure/db/schema';
import { ledgerRepo } from '@/infrastructure/repositories/ledger-repository';
import { verifyEvidenceBundle } from '@/domain/ledger/verifier';
import { GENESIS_HASH } from '@/domain/ledger/canonicalize';

describe('Ledger & Immutability Integration (Real PostgreSQL)', () => {
  let workspaceId: string;
  let principalId: string;

  beforeAll(async () => {
    const db = getDb();
    const pRows = await db
      .insert(principals)
      .values({
        email: `ledger_test_${Date.now()}@test.com`,
        displayName: 'Ledger Tester',
      })
      .returning();
    principalId = pRows[0].id;

    const wRows = await db
      .insert(workspaces)
      .values({
        name: 'Ledger Test Workspace',
        createdBy: principalId,
      })
      .returning();
    workspaceId = wRows[0].id;
  });

  it('appends events in monotonic sequence with tamper-evident hash chaining', async () => {
    const streamId = `stream_${Date.now()}`;
    const e1 = await ledgerRepo.appendEvent({
      workspaceId,
      streamId,
      correlationId: streamId,
      eventType: 'REQUEST_CREATED',
      actor: { kind: 'USER', id: principalId },
      payload: { intent: 'Office Chairs' },
    });
    expect(e1.sequence).toBe(1);
    expect(e1.prevHash).toBe(GENESIS_HASH);

    const e2 = await ledgerRepo.appendEvent({
      workspaceId,
      streamId,
      correlationId: streamId,
      eventType: 'TERMS_SEALED',
      actor: { kind: 'USER', id: principalId },
      payload: { merchant: 'Keychron', totalMinor: '12000' },
    });
    expect(e2.sequence).toBe(2);
    expect(e2.prevHash).toBe(e1.hash);

    const bundle = await ledgerRepo.exportEvidenceBundle(workspaceId, streamId);
    expect(bundle.totalEvents).toBe(2);
    expect(bundle.headHash).toBe(e2.hash);

    const audit = await verifyEvidenceBundle(bundle);
    expect(audit.valid).toBe(true);
    expect(audit.reasonCode).toBe('VALID');
    expect(audit.verifiedCount).toBe(2);
  });

  it('enforces database-level immutability: rejects UPDATE and DELETE on ledger_entries', async () => {
    const db = getDb();
    const streamId = `stream_immutable_${Date.now()}`;
    const entry = await ledgerRepo.appendEvent({
      workspaceId,
      streamId,
      correlationId: streamId,
      eventType: 'ORDER_CREATED',
      actor: { kind: 'SYSTEM', id: 'engine' },
      payload: { note: 'Initial payload' },
    });

    await expect(
      db.execute(sql`UPDATE ledger_entries SET payload = '{"tampered": true}' WHERE id = ${entry.id}`)
    ).rejects.toThrow(/append-only/i);

    await expect(
      db.execute(sql`DELETE FROM ledger_entries WHERE id = ${entry.id}`)
    ).rejects.toThrow(/append-only/i);
  });

  it('safely handles concurrent event appends to the same stream', async () => {
    const streamId = `stream_concurrent_${Date.now()}`;

    // Append 4 events concurrently
    await Promise.all(
      [1, 2, 3, 4].map((i) =>
        ledgerRepo.appendEvent({
          workspaceId,
          streamId,
          correlationId: streamId,
          eventType: 'PROPOSAL_REVISED',
          actor: { kind: 'USER', id: principalId },
          payload: { batchIndex: i },
        })
      )
    );

    const events = await ledgerRepo.listByStream(streamId);
    expect(events.length).toBe(4);
    expect(events.map((e) => e.sequence)).toEqual([1, 2, 3, 4]);

    const bundle = await ledgerRepo.exportEvidenceBundle(workspaceId, streamId);
    const audit = await verifyEvidenceBundle(bundle);
    expect(audit.valid).toBe(true);
  });
});

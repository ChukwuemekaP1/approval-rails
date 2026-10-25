import { describe, it, expect } from 'vitest';
import { canonicalizeEntry, computeSha256Hex, GENESIS_HASH } from '@/domain/ledger/canonicalize';
import { verifyEvidenceBundle } from '@/domain/ledger/verifier';
import { sanitizePayload, isSensitiveKey } from '@/domain/ledger/redaction';
import { EvidenceBundle, LedgerEntry } from '@/domain/ledger/types';

describe('Ledger Domain Canonicalization and Redaction', () => {
  it('redacts sensitive fields from payloads', () => {
    expect(isSensitiveKey('password')).toBe(true);
    expect(isSensitiveKey('token')).toBe(true);
    expect(isSensitiveKey('normal')).toBe(false);

    const cleaned = sanitizePayload({
      orderId: 'ord-123',
      pin: '123456',
      token: 'secret',
      nested: { secret: 'shh', note: 'desk' },
    });

    expect(cleaned.orderId).toBe('ord-123');
    expect(cleaned.pin).toBe('[REDACTED]');
    expect(cleaned.token).toBe('[REDACTED]');
    expect((cleaned.nested as any).secret).toBe('[REDACTED]');
    expect((cleaned.nested as any).note).toBe('desk');
  });

  it('generates deterministic SHA-256 hashes regardless of key order', async () => {
    const e1 = canonicalizeEntry({
      streamId: 's1',
      sequence: 1,
      eventType: 'PROPOSAL_CREATED',
      timestamp: '2026-10-25T12:00:00Z',
      actor: { kind: 'USER', id: 'u1' },
      payload: { b: 2, a: 1 },
      prevHash: GENESIS_HASH,
    });
    const e2 = canonicalizeEntry({
      streamId: 's1',
      sequence: 1,
      eventType: 'PROPOSAL_CREATED',
      timestamp: '2026-10-25T12:00:00Z',
      actor: { kind: 'USER', id: 'u1' },
      payload: { a: 1, b: 2 },
      prevHash: GENESIS_HASH,
    });
    expect(e1).toBe(e2);
    expect(await computeSha256Hex(e1)).toBe(await computeSha256Hex(e2));
  });
});

describe('Evidence Bundle Verifier', () => {
  const mockEntry = async (seq: number, prev: string, payload: Record<string, unknown>): Promise<LedgerEntry> => {
    const json = canonicalizeEntry({
      streamId: 's1',
      sequence: seq,
      eventType: 'ORDER_CREATED',
      timestamp: `2026-10-25T12:00:0${seq}Z`,
      actor: { kind: 'USER', id: 'u1' },
      payload,
      prevHash: prev,
    });
    const hash = await computeSha256Hex(json);
    return {
      id: `e-${seq}`,
      workspaceId: 'w1',
      streamId: 's1',
      correlationId: 'c1',
      sequence: seq,
      eventType: 'ORDER_CREATED',
      actor: { kind: 'USER', id: 'u1' },
      payload,
      prevHash: prev,
      hash,
      timestamp: `2026-10-25T12:00:0${seq}Z`,
    };
  };

  it('validates a valid hash chain bundle', async () => {
    const e1 = await mockEntry(1, GENESIS_HASH, { amt: 100 });
    const e2 = await mockEntry(2, e1.hash, { amt: 200 });

    const bundle: EvidenceBundle = {
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      workspaceId: 'w1',
      streamId: 's1',
      correlationId: 'c1',
      totalEvents: 2,
      headHash: e2.hash,
      events: [e1, e2],
    };
    const res = await verifyEvidenceBundle(bundle);
    expect(res.valid).toBe(true);
    expect(res.reasonCode).toBe('VALID');
  });

  it('detects payload tampering', async () => {
    const e1 = await mockEntry(1, GENESIS_HASH, { price: 100 });
    e1.payload.price = 50;

    const bundle: EvidenceBundle = {
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      workspaceId: 'w1',
      streamId: 's1',
      correlationId: 'c1',
      totalEvents: 1,
      headHash: e1.hash,
      events: [e1],
    };
    const res = await verifyEvidenceBundle(bundle);
    expect(res.valid).toBe(false);
    expect(res.reasonCode).toBe('HASH_MISMATCH');
  });
});

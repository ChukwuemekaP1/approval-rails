import { LedgerActor, LedgerEventType } from './types';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export function canonicalizeValue(val: unknown): unknown {
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(canonicalizeValue);
  }
  const obj = val as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: Record<string, unknown> = {};
  for (const k of sortedKeys) {
    if (obj[k] !== undefined) {
      sortedObj[k] = canonicalizeValue(obj[k]);
    }
  }
  return sortedObj;
}

export function canonicalizeEntry(params: {
  streamId: string;
  sequence: number;
  eventType: LedgerEventType;
  timestamp: string;
  actor: LedgerActor;
  payload: Record<string, unknown>;
  prevHash: string;
}): string {
  const normalized = {
    actor: {
      id: params.actor.id,
      kind: params.actor.kind,
      name: params.actor.name || null,
    },
    eventType: params.eventType,
    payload: params.payload,
    prevHash: params.prevHash,
    sequence: params.sequence,
    streamId: params.streamId,
    timestamp: params.timestamp,
  };

  return JSON.stringify(canonicalizeValue(normalized));
}

export async function computeSha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

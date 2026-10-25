import { EvidenceBundle, VerificationResult } from './types';
import { canonicalizeEntry, computeSha256Hex, GENESIS_HASH } from './canonicalize';

export async function verifyEvidenceBundle(bundle: unknown): Promise<VerificationResult> {
  if (!bundle || typeof bundle !== 'object') {
    return {
      valid: false,
      reasonCode: 'INVALID_STRUCTURE',
      error: 'Bundle is null or not an object',
      verifiedCount: 0,
    };
  }

  const b = bundle as EvidenceBundle;
  if (!Array.isArray(b.events) || b.schemaVersion !== '1.0.0') {
    return {
      valid: false,
      reasonCode: 'INVALID_STRUCTURE',
      error: 'Missing schemaVersion 1.0.0 or events array',
      verifiedCount: 0,
    };
  }

  if (b.events.length === 0) {
    return {
      valid: false,
      reasonCode: 'EMPTY_BUNDLE',
      error: 'Evidence bundle contains zero events',
      verifiedCount: 0,
    };
  }

  for (let i = 0; i < b.events.length; i++) {
    const event = b.events[i];
    const expectedSeq = i + 1;

    if (event.sequence !== expectedSeq) {
      return {
        valid: false,
        reasonCode: 'SEQUENCE_GAP',
        error: `Sequence gap at index ${i}: expected ${expectedSeq}, got ${event.sequence}`,
        verifiedCount: i,
        brokenSequence: event.sequence,
      };
    }

    if (i === 0 && event.prevHash !== GENESIS_HASH) {
      return {
        valid: false,
        reasonCode: 'INVALID_GENESIS',
        error: `Event sequence 1 must point to GENESIS_HASH`,
        verifiedCount: 0,
        brokenSequence: 1,
      };
    }

    if (i > 0 && event.prevHash !== b.events[i - 1].hash) {
      return {
        valid: false,
        reasonCode: 'PREV_HASH_MISMATCH',
        error: `Broken chain at sequence ${event.sequence}: prevHash does not match predecessor hash`,
        verifiedCount: i,
        brokenSequence: event.sequence,
      };
    }

    const canonicalJson = canonicalizeEntry({
      streamId: event.streamId,
      sequence: event.sequence,
      eventType: event.eventType,
      timestamp: event.timestamp,
      actor: event.actor,
      payload: event.payload,
      prevHash: event.prevHash,
    });

    const computedHash = await computeSha256Hex(canonicalJson);
    if (computedHash !== event.hash) {
      return {
        valid: false,
        reasonCode: 'HASH_MISMATCH',
        error: `Cryptographic integrity failure at sequence ${event.sequence}: payload or event tampering detected`,
        verifiedCount: i,
        brokenSequence: event.sequence,
      };
    }
  }

  const lastEvent = b.events[b.events.length - 1];
  if (b.headHash !== lastEvent.hash) {
    return {
      valid: false,
      reasonCode: 'HEAD_HASH_MISMATCH',
      error: `Bundle headHash ${b.headHash} does not match final event hash ${lastEvent.hash}`,
      verifiedCount: b.events.length,
    };
  }

  return {
    valid: true,
    reasonCode: 'VALID',
    verifiedCount: b.events.length,
  };
}

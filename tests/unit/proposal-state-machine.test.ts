import { describe, it, expect } from 'vitest';
import {
  canTransition,
  assertValidTransition,
  isModifiableStatus,
  isSealedStatus,
  isTerminalStatus,
} from '@/domain/proposal/state-machine';
import { ProposalStatus } from '@/domain/proposal/types';

describe('Domain: Proposal State Machine', () => {
  it('permits legal state transitions', () => {
    expect(canTransition('DRAFT', 'NEEDS_REVIEW')).toBe(true);
    expect(canTransition('DRAFT', 'BLOCKED')).toBe(true);
    expect(canTransition('NEEDS_REVIEW', 'SEALED')).toBe(true);
    expect(canTransition('SEALED', 'AUTHORIZED')).toBe(true);
    expect(canTransition('SEALED', 'NEEDS_REVIEW')).toBe(true); // Unseal
    expect(canTransition('NEEDS_REVIEW', 'EXPIRED')).toBe(true);
    expect(canTransition('SEALED', 'EXPIRED')).toBe(true);
  });

  it('rejects illegal state transitions', () => {
    expect(canTransition('DRAFT', 'AUTHORIZED')).toBe(false);
    expect(canTransition('NEEDS_REVIEW', 'AUTHORIZED')).toBe(false); // Must seal first!
    expect(canTransition('AUTHORIZED', 'DRAFT')).toBe(false); // Terminal
    expect(canTransition('AUTHORIZED', 'NEEDS_REVIEW')).toBe(false);
    expect(canTransition('CANCELLED', 'DRAFT')).toBe(false);
  });

  it('assertValidTransition throws on invalid transition', () => {
    expect(() => assertValidTransition('NEEDS_REVIEW', 'AUTHORIZED')).toThrow(
      /Illegal proposal state transition/
    );
    expect(() => assertValidTransition('DRAFT', 'NEEDS_REVIEW')).not.toThrow();
  });

  it('identifies modifiable and terminal statuses correctly', () => {
    expect(isModifiableStatus('DRAFT')).toBe(true);
    expect(isModifiableStatus('NEEDS_REVIEW')).toBe(true);
    expect(isModifiableStatus('BLOCKED')).toBe(true);
    expect(isModifiableStatus('SEALED')).toBe(false);
    expect(isModifiableStatus('AUTHORIZED')).toBe(false);

    expect(isSealedStatus('SEALED')).toBe(true);
    expect(isSealedStatus('NEEDS_REVIEW')).toBe(false);

    expect(isTerminalStatus('AUTHORIZED')).toBe(true);
    expect(isTerminalStatus('CANCELLED')).toBe(true);
    expect(isTerminalStatus('SEALED')).toBe(false);
  });
});

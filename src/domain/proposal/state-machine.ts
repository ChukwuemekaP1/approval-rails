import { ProposalStatus } from './types';

const LEGAL_TRANSITIONS: Record<ProposalStatus, Set<ProposalStatus>> = {
  DRAFT: new Set(['NEEDS_REVIEW', 'BLOCKED', 'CANCELLED']),
  NEEDS_REVIEW: new Set(['DRAFT', 'BLOCKED', 'SEALED', 'CANCELLED', 'EXPIRED']),
  BLOCKED: new Set(['DRAFT', 'NEEDS_REVIEW', 'CANCELLED']),
  SEALED: new Set(['NEEDS_REVIEW', 'AUTHORIZED', 'EXPIRED', 'CANCELLED']),
  AUTHORIZED: new Set([]), // Terminal in Phase 5
  EXPIRED: new Set(['DRAFT', 'CANCELLED']),
  CANCELLED: new Set([]), // Terminal
};

export function canTransition(from: ProposalStatus, to: ProposalStatus): boolean {
  if (from === to) return true;
  return LEGAL_TRANSITIONS[from]?.has(to) ?? false;
}

export function assertValidTransition(from: ProposalStatus, to: ProposalStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal proposal state transition from "${from}" to "${to}"`);
  }
}

export function isModifiableStatus(status: ProposalStatus): boolean {
  return status === 'DRAFT' || status === 'NEEDS_REVIEW' || status === 'BLOCKED';
}

export function isSealedStatus(status: ProposalStatus): boolean {
  return status === 'SEALED';
}

export function isTerminalStatus(status: ProposalStatus): boolean {
  return status === 'AUTHORIZED' || status === 'CANCELLED';
}

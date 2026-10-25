import { PaymentStatus } from './types';

const LEGAL_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  CREATED: ['APPROVAL_PENDING', 'CAPTURE_PENDING', 'FAILED', 'UNKNOWN'],
  APPROVAL_PENDING: ['CAPTURE_PENDING', 'COMPLETED', 'FAILED', 'UNKNOWN'],
  CAPTURE_PENDING: ['COMPLETED', 'FAILED', 'UNKNOWN'],
  UNKNOWN: ['COMPLETED', 'FAILED', 'UNKNOWN'],
  COMPLETED: [],
  FAILED: [],
};

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  if (from === to) return true;
  const allowed = LEGAL_TRANSITIONS[from];
  return allowed.includes(to);
}

export function assertValidPaymentTransition(from: PaymentStatus, to: PaymentStatus): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(`Illegal payment state transition from ${from} to ${to}`);
  }
}

export function isTerminalPaymentStatus(status: PaymentStatus): boolean {
  return status === 'COMPLETED' || status === 'FAILED';
}

export function isReconciliationRequired(status: PaymentStatus): boolean {
  return status === 'UNKNOWN' || status === 'CAPTURE_PENDING';
}

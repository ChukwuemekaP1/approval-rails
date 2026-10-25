import { describe, it, expect } from 'vitest';
import {
  canTransitionPayment,
  assertValidPaymentTransition,
  isTerminalPaymentStatus,
  isReconciliationRequired,
} from '@/domain/payment/state-machine';

describe('Payment State Machine Domain Logic', () => {
  it('allows legal forward transitions', () => {
    expect(canTransitionPayment('CREATED', 'APPROVAL_PENDING')).toBe(true);
    expect(canTransitionPayment('APPROVAL_PENDING', 'CAPTURE_PENDING')).toBe(true);
    expect(canTransitionPayment('CAPTURE_PENDING', 'COMPLETED')).toBe(true);
    expect(canTransitionPayment('CAPTURE_PENDING', 'UNKNOWN')).toBe(true);
    expect(canTransitionPayment('UNKNOWN', 'COMPLETED')).toBe(true);
    expect(canTransitionPayment('UNKNOWN', 'FAILED')).toBe(true);
  });

  it('rejects illegal transitions from terminal or backward states', () => {
    expect(canTransitionPayment('COMPLETED', 'CREATED')).toBe(false);
    expect(canTransitionPayment('COMPLETED', 'APPROVAL_PENDING')).toBe(false);
    expect(canTransitionPayment('FAILED', 'COMPLETED')).toBe(false);
    expect(() => assertValidPaymentTransition('COMPLETED', 'FAILED')).toThrow();
  });

  it('correctly identifies terminal and reconciliation states', () => {
    expect(isTerminalPaymentStatus('COMPLETED')).toBe(true);
    expect(isTerminalPaymentStatus('FAILED')).toBe(true);
    expect(isTerminalPaymentStatus('APPROVAL_PENDING')).toBe(false);
    expect(isTerminalPaymentStatus('UNKNOWN')).toBe(false);

    expect(isReconciliationRequired('UNKNOWN')).toBe(true);
    expect(isReconciliationRequired('CAPTURE_PENDING')).toBe(true);
    expect(isReconciliationRequired('COMPLETED')).toBe(false);
  });
});

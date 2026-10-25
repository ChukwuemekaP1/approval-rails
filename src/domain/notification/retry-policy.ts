import { OutboxStatus } from './types';

export const MAX_OUTBOX_ATTEMPTS = 5;
export const BASE_BACKOFF_MS = 1000;
export const MAX_BACKOFF_MS = 60000;

export function isRetryableHttpStatus(statusCode: number): boolean {
  if (statusCode >= 200 && statusCode < 300) return false;
  if (statusCode === 429) return true;
  if (statusCode >= 500) return true;
  return false;
}

export function computeNextRetryDelayMs(attemptNumber: number): number {
  const exponent = Math.max(0, Math.min(attemptNumber - 1, 6));
  const backoff = BASE_BACKOFF_MS * Math.pow(2, exponent);
  return Math.min(backoff, MAX_BACKOFF_MS);
}

export function computeNextAttemptDate(attemptNumber: number, fromDate = new Date()): Date {
  const delayMs = computeNextRetryDelayMs(attemptNumber);
  return new Date(fromDate.getTime() + delayMs);
}

export interface DeliveryClassification {
  outcomeStatus: OutboxStatus;
  retryInMs?: number;
}

export function classifyDeliveryResult(
  httpStatus: number | null,
  currentAttempts: number,
  maxAttempts = MAX_OUTBOX_ATTEMPTS
): DeliveryClassification {
  if (httpStatus !== null && httpStatus >= 200 && httpStatus < 300) {
    return { outcomeStatus: 'DISPATCHED' };
  }

  const isTerminalClientError =
    httpStatus !== null && httpStatus >= 400 && httpStatus < 500 && httpStatus !== 429;

  if (isTerminalClientError) {
    return { outcomeStatus: 'DEAD_LETTER' };
  }

  if (currentAttempts >= maxAttempts) {
    return { outcomeStatus: 'FAILED' };
  }

  const retryInMs = computeNextRetryDelayMs(currentAttempts);
  return {
    outcomeStatus: 'PENDING',
    retryInMs,
  };
}

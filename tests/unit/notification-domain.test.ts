import { describe, it, expect } from 'vitest';
import {
  sanitizeNotificationPayload,
  maskWebhookUrl,
} from '@/domain/notification/sanitizer';
import {
  isRetryableHttpStatus,
  computeNextRetryDelayMs,
  classifyDeliveryResult,
} from '@/domain/notification/retry-policy';

describe('Notification Payload Sanitizer & Redaction', () => {
  it('strips credentials, passkey secrets, tokens and prompts', () => {
    const raw = {
      eventType: 'PAYMENT_COMPLETED' as const,
      workspaceId: 'ws-100',
      resourceId: 'ord-200',
      summary: 'Order #ord-200 completed',
      amountMinor: '15000',
      currency: 'USD',
      merchant: 'GitHub',
      password: 'supersecretpassword',
      pin: '1234',
      token: 'bearer_token_xyz',
      challenge: 'passkey_challenge_abc',
      prompt: 'buy me an expensive server',
      apiKey: 'sk-12345',
    };

    const sanitized = sanitizeNotificationPayload(raw);

    expect(sanitized.eventType).toBe('PAYMENT_COMPLETED');
    expect(sanitized.workspaceId).toBe('ws-100');
    expect(sanitized.resourceId).toBe('ord-200');
    expect(sanitized.amountMinor).toBe('15000');
    expect(sanitized.currency).toBe('USD');
    expect(sanitized.merchant).toBe('GitHub');

    const asAny = sanitized as any;
    expect(asAny.password).toBeUndefined();
    expect(asAny.pin).toBeUndefined();
    expect(asAny.token).toBeUndefined();
    expect(asAny.challenge).toBeUndefined();
    expect(asAny.prompt).toBeUndefined();
    expect(asAny.apiKey).toBeUndefined();
  });

  it('masks webhook URL for safe logging and display', () => {
    expect(maskWebhookUrl(null)).toBeNull();
    expect(maskWebhookUrl('https://hooks.zapier.com/hooks/catch/123456/abcdef/')).toContain('hooks.zapier.com');
    expect(maskWebhookUrl('https://hooks.zapier.com/hooks/catch/123456/abcdef/')).toContain('***');
    expect(maskWebhookUrl('https://hooks.zapier.com/hooks/catch/123456/abcdef/')).not.toContain('abcdef');
  });
});

describe('Notification Retry Policy & Classification', () => {
  it('identifies retryable HTTP status codes correctly', () => {
    expect(isRetryableHttpStatus(200)).toBe(false);
    expect(isRetryableHttpStatus(201)).toBe(false);
    expect(isRetryableHttpStatus(400)).toBe(false);
    expect(isRetryableHttpStatus(404)).toBe(false);
    expect(isRetryableHttpStatus(429)).toBe(true);
    expect(isRetryableHttpStatus(500)).toBe(true);
    expect(isRetryableHttpStatus(503)).toBe(true);
  });

  it('calculates bounded exponential backoff delay', () => {
    expect(computeNextRetryDelayMs(1)).toBe(1000);
    expect(computeNextRetryDelayMs(2)).toBe(2000);
    expect(computeNextRetryDelayMs(3)).toBe(4000);
    expect(computeNextRetryDelayMs(4)).toBe(8000);
    expect(computeNextRetryDelayMs(5)).toBe(16000);
    expect(computeNextRetryDelayMs(10)).toBe(60000); // capped at 60s
  });

  it('classifies delivery outcomes accurately', () => {
    expect(classifyDeliveryResult(200, 1).outcomeStatus).toBe('DISPATCHED');
    expect(classifyDeliveryResult(400, 1).outcomeStatus).toBe('DEAD_LETTER');
    expect(classifyDeliveryResult(404, 1).outcomeStatus).toBe('DEAD_LETTER');

    const retry = classifyDeliveryResult(500, 2);
    expect(retry.outcomeStatus).toBe('PENDING');
    expect(retry.retryInMs).toBe(2000);

    const exhausted = classifyDeliveryResult(500, 5, 5);
    expect(exhausted.outcomeStatus).toBe('FAILED');
  });
});

import { describe, it, expect } from 'vitest';
import { MockPayPalAdapter } from '@/infrastructure/paypal/mock-paypal-adapter';
import { PayPalTimeoutError } from '@/domain/payment/errors';

describe('PayPal Gateway Adapter Unit Tests', () => {
  it('creates mock PayPal order and returns approval url', async () => {
    const adapter = new MockPayPalAdapter();
    const result = await adapter.createOrder(
      {
        referenceId: 'order-123',
        amountMinor: 1050n,
        currency: 'USD',
        merchant: 'Acme Supplies',
        description: 'Test purchase',
        returnUrl: 'http://localhost/return',
        cancelUrl: 'http://localhost/cancel',
      },
      'idem-key-1'
    );

    expect(result.paypalOrderId).toMatch(/^MOCK-ORDER-/);
    expect(result.status).toBe('CREATED');
    expect(result.approvalUrl).toContain('checkoutnow?token=');
  });

  it('captures approved order successfully', async () => {
    const adapter = new MockPayPalAdapter();
    const created = await adapter.createOrder(
      {
        referenceId: 'order-123',
        amountMinor: 2500n,
        currency: 'USD',
        merchant: 'Office Depot',
        description: 'Paper',
        returnUrl: 'http://localhost/return',
        cancelUrl: 'http://localhost/cancel',
      },
      'idem-1'
    );

    const capture = await adapter.captureOrder(created.paypalOrderId, 'idem-cap-1');
    expect(capture.status).toBe('COMPLETED');
    expect(capture.captureId).toMatch(/^MOCK-CAP-/);
  });

  it('simulates network timeout during capture', async () => {
    const adapter = new MockPayPalAdapter();
    adapter.simulateTimeout = true;

    await expect(
      adapter.captureOrder('MOCK-ORDER-999', 'idem-timeout-1')
    ).rejects.toThrow(PayPalTimeoutError);
  });

  it('verifies webhook signatures with mock adapter', async () => {
    const adapter = new MockPayPalAdapter();
    const valid = await adapter.verifyWebhookSignature({
      headers: { 'paypal-auth-algo': 'SHA256withRSA' },
      rawBody: '{"id":"WH-1"}',
      webhookId: 'test-webhook-id',
    });
    expect(valid).toBe(true);

    adapter.simulateInvalidWebhook = true;
    const invalid = await adapter.verifyWebhookSignature({
      headers: { 'paypal-auth-algo': 'SHA256withRSA' },
      rawBody: '{"id":"WH-1"}',
      webhookId: 'test-webhook-id',
    });
    expect(invalid).toBe(false);
  });
});

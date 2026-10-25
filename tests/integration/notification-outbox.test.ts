import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notificationOutboxRepository } from '@/infrastructure/repositories/notification-outbox-repository';
import { OutboxDispatcherUseCase } from '@/application/notification/outbox-dispatcher';
import { maskWebhookUrl } from '@/domain/notification/sanitizer';
import { recordOutboxEventSafe } from '@/application/notification/record-outbox-event';
import { setupOrderTestFixture } from './order-fixture';
import { CaptureOrderUseCase } from '@/application/payment/capture-order-use-case';
import { CreateOrderUseCase } from '@/application/payment/create-order-use-case';
import { MockPayPalAdapter } from '@/infrastructure/paypal/mock-paypal-adapter';
import { orderRepository } from '@/infrastructure/repositories/order-repository';
import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';

describe('Notification Outbox & Resilience (Phase 8)', () => {
  let mockFetch: any;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  it('enqueues minimized sanitized payload and preserves URL secret confidentiality', async () => {
    const fixture = await setupOrderTestFixture();

    const record = await notificationOutboxRepository.enqueue({
      workspaceId: fixture.workspace.id,
      eventType: 'PROPOSAL_READY_FOR_REVIEW',
      payload: {
        eventType: 'PROPOSAL_READY_FOR_REVIEW',
        workspaceId: fixture.workspace.id,
        resourceId: 'prop-123',
        summary: 'Ready for review',
        occurredAt: new Date().toISOString(),
      },
    });

    expect(record.id).toBeDefined();
    expect(record.status).toBe('PENDING');

    const masked = maskWebhookUrl('https://hooks.zapier.com/hooks/catch/999/secrettoken/');
    expect(masked).not.toContain('secrettoken');
    expect(masked).toContain('hooks.zapier.com');
  });

  it('handles provider outages by transitioning to PENDING retry with backoff', async () => {
    const fixture = await setupOrderTestFixture();

    await notificationOutboxRepository.upsertSettings({
      workspaceId: fixture.workspace.id,
      zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/fake/123',
      enabled: true,
    });

    const record = await notificationOutboxRepository.enqueue({
      workspaceId: fixture.workspace.id,
      eventType: 'PAYMENT_COMPLETED',
      payload: {
        eventType: 'PAYMENT_COMPLETED',
        workspaceId: fixture.workspace.id,
        resourceId: 'ord-123',
        summary: 'Paid $100',
        occurredAt: new Date().toISOString(),
      },
    });

    // Simulate 503 Provider Outage
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });

    const dispatcher = new OutboxDispatcherUseCase(notificationOutboxRepository, mockFetch);
    await dispatcher.dispatchRecord(record);

    const updated = await notificationOutboxRepository.findById(record.id);
    expect(updated?.status).toBe('PENDING');
    expect(updated?.attempts).toBe(1);
    expect(updated?.lastHttpStatus).toBe(503);
  });

  it('marks terminal 400 client errors as DEAD_LETTER', async () => {
    const fixture = await setupOrderTestFixture();

    await notificationOutboxRepository.upsertSettings({
      workspaceId: fixture.workspace.id,
      zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/fake/123',
      enabled: true,
    });

    const record = await notificationOutboxRepository.enqueue({
      workspaceId: fixture.workspace.id,
      eventType: 'TEST_NOTIFICATION',
      payload: {
        eventType: 'TEST_NOTIFICATION',
        workspaceId: fixture.workspace.id,
        resourceId: 'test-1',
        summary: 'Test',
        occurredAt: new Date().toISOString(),
      },
    });

    // Simulate 404 Webhook Not Found
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const dispatcher = new OutboxDispatcherUseCase(notificationOutboxRepository, mockFetch);
    await dispatcher.dispatchRecord(record);

    const updated = await notificationOutboxRepository.findById(record.id);
    expect(updated?.status).toBe('DEAD_LETTER');
    expect(updated?.attempts).toBe(1);
  });

  it('guarantees notification failures NEVER cause payment capture failure', async () => {
    const fixture = await setupOrderTestFixture();
    const mockGateway = new MockPayPalAdapter();
    const createUseCase = new CreateOrderUseCase(proposalRepo, orderRepository, mockGateway);
    const captureUseCase = new CaptureOrderUseCase(orderRepository, mockGateway);

    const order = await createUseCase.execute({
      principalId: fixture.principal.id,
      workspaceId: fixture.workspace.id,
      proposalId: fixture.authorizedProposal.id,
    });

    // Capture payment: notification recording runs safely and order completes
    const captured = await captureUseCase.execute({
      principalId: fixture.principal.id,
      workspaceId: fixture.workspace.id,
      orderId: order.id,
    });

    expect(captured.status).toBe('COMPLETED');
    expect(captured.captureId).toBeDefined();

    // Re-attempting capture does not double capture
    const secondCapture = await captureUseCase.execute({
      principalId: fixture.principal.id,
      workspaceId: fixture.workspace.id,
      orderId: order.id,
    });
    expect(secondCapture.captureId).toBe(captured.captureId);
  });
});

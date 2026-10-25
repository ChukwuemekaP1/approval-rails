import { describe, it, expect, beforeEach } from 'vitest';
import { setupOrderTestFixture } from './order-fixture';
import { CreateOrderUseCase } from '@/application/payment/create-order-use-case';
import { CaptureOrderUseCase } from '@/application/payment/capture-order-use-case';
import { ReconcileOrderUseCase } from '@/application/payment/reconcile-order-use-case';
import { PayPalWebhookUseCase } from '@/application/payment/webhook-use-case';
import { MockPayPalAdapter } from '@/infrastructure/paypal/mock-paypal-adapter';
import { orderRepository } from '@/infrastructure/repositories/order-repository';
import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';

describe('Order & Settlement Lifecycle Database Integration', () => {
  let mockGateway: MockPayPalAdapter;
  let createUseCase: CreateOrderUseCase;
  let captureUseCase: CaptureOrderUseCase;
  let reconcileUseCase: ReconcileOrderUseCase;
  let webhookUseCase: PayPalWebhookUseCase;

  beforeEach(() => {
    mockGateway = new MockPayPalAdapter();
    createUseCase = new CreateOrderUseCase(proposalRepo, orderRepository, mockGateway);
    captureUseCase = new CaptureOrderUseCase(orderRepository, mockGateway);
    reconcileUseCase = new ReconcileOrderUseCase(orderRepository, mockGateway);
    webhookUseCase = new PayPalWebhookUseCase(orderRepository, mockGateway);
  });

  it('creates, captures, and completes an order from an authorized proposal', async () => {
    const fixture = await setupOrderTestFixture();

    const order = await createUseCase.execute({
      principalId: fixture.principal.id,
      workspaceId: fixture.workspace.id,
      proposalId: fixture.authorizedProposal.id,
    });

    expect(order.id).toBeDefined();
    expect(order.status).toBe('APPROVAL_PENDING');
    expect(order.amountMinor).toBe(fixture.authorizedProposal.totalAmountMinor);
    expect(order.currency).toBe(fixture.authorizedProposal.currency);
    expect(order.merchant).toBe(fixture.authorizedProposal.merchant);
    expect(order.approvalUrl).toContain('checkoutnow?token=');

    const captured = await captureUseCase.execute({
      principalId: fixture.principal.id,
      workspaceId: fixture.workspace.id,
      orderId: order.id,
    });

    expect(captured.status).toBe('COMPLETED');
    expect(captured.captureId).toMatch(/^MOCK-CAP-/);
    expect(captured.capturedAt).toBeInstanceOf(Date);
  });

  it('transitions to UNKNOWN on timeout and resolves via reconciliation', async () => {
    const fixture = await setupOrderTestFixture();
    mockGateway.simulateTimeout = true;

    const order = await createUseCase.execute({
      principalId: fixture.principal.id,
      workspaceId: fixture.workspace.id,
      proposalId: fixture.authorizedProposal.id,
    });

    const timedOut = await captureUseCase.execute({
      principalId: fixture.principal.id,
      workspaceId: fixture.workspace.id,
      orderId: order.id,
    });

    expect(timedOut.status).toBe('UNKNOWN');

    mockGateway.simulateTimeout = false;
    const ppOrder = mockGateway.orders.get(order.paypalOrderId);
    if (ppOrder) ppOrder.status = 'COMPLETED';

    const reconciled = await reconcileUseCase.execute(
      order.id,
      fixture.principal.id,
      fixture.workspace.id
    );

    expect(reconciled.status).toBe('COMPLETED');
    expect(reconciled.reconciledAt).toBeInstanceOf(Date);
  });
});

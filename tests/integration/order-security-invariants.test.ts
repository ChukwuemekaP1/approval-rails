import { describe, it, expect, beforeEach } from 'vitest';
import { setupOrderTestFixture } from './order-fixture';
import { CreateOrderUseCase } from '@/application/payment/create-order-use-case';
import { CaptureOrderUseCase } from '@/application/payment/capture-order-use-case';
import { PayPalWebhookUseCase } from '@/application/payment/webhook-use-case';
import { MockPayPalAdapter } from '@/infrastructure/paypal/mock-paypal-adapter';
import { orderRepository } from '@/infrastructure/repositories/order-repository';
import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import {
  UnauthorizedPaymentActionError,
  DuplicateOrderError,
  WebhookSignatureVerificationError,
} from '@/domain/payment/errors';

describe('Order & Settlement Security Invariants (SEC-01 & SEC-02)', () => {
  let mockGateway: MockPayPalAdapter;
  let createUseCase: CreateOrderUseCase;
  let captureUseCase: CaptureOrderUseCase;
  let webhookUseCase: PayPalWebhookUseCase;

  beforeEach(() => {
    mockGateway = new MockPayPalAdapter();
    createUseCase = new CreateOrderUseCase(proposalRepo, orderRepository, mockGateway);
    captureUseCase = new CaptureOrderUseCase(orderRepository, mockGateway);
    webhookUseCase = new PayPalWebhookUseCase(orderRepository, mockGateway);
  });

  it('enforces SEC-01: another principal cannot create order against another users mandate', async () => {
    const fixture = await setupOrderTestFixture();

    const intruder = await principalRepo.create({
      email: `intruder-${Date.now()}@test.local`,
      displayName: 'Intruder User',
    });
    await workspaceRepo.addMember(fixture.workspace.id, intruder.id, 'MEMBER');

    await expect(
      createUseCase.execute({
        principalId: intruder.id,
        workspaceId: fixture.workspace.id,
        proposalId: fixture.authorizedProposal.id,
      })
    ).rejects.toThrow(UnauthorizedPaymentActionError);
  });

  it('enforces SEC-02: another principal cannot capture another users order', async () => {
    const fixture = await setupOrderTestFixture();

    const order = await createUseCase.execute({
      principalId: fixture.principal.id,
      workspaceId: fixture.workspace.id,
      proposalId: fixture.authorizedProposal.id,
    });

    const intruder = await principalRepo.create({
      email: `intruder2-${Date.now()}@test.local`,
      displayName: 'Intruder User 2',
    });
    await workspaceRepo.addMember(fixture.workspace.id, intruder.id, 'MEMBER');

    await expect(
      captureUseCase.execute({
        principalId: intruder.id,
        workspaceId: fixture.workspace.id,
        orderId: order.id,
      })
    ).rejects.toThrow(UnauthorizedPaymentActionError);
  });

  it('prevents duplicate order creation for the same proposal mandate', async () => {
    const fixture = await setupOrderTestFixture();

    await createUseCase.execute({
      principalId: fixture.principal.id,
      workspaceId: fixture.workspace.id,
      proposalId: fixture.authorizedProposal.id,
    });

    await expect(
      createUseCase.execute({
        principalId: fixture.principal.id,
        workspaceId: fixture.workspace.id,
        proposalId: fixture.authorizedProposal.id,
      })
    ).rejects.toThrow(DuplicateOrderError);
  });

  it('rejects forged webhook signatures and handles duplicates idempotently', async () => {
    mockGateway.simulateInvalidWebhook = true;

    await expect(
      webhookUseCase.execute({
        headers: { 'paypal-auth-algo': 'SHA256withRSA' },
        rawBody: JSON.stringify({ id: `WH-FORGED-${Date.now()}`, event_type: 'PAYMENT.CAPTURE.COMPLETED' }),
      })
    ).rejects.toThrow(WebhookSignatureVerificationError);

    mockGateway.simulateInvalidWebhook = false;
    const eventId = `WH-VALID-${Date.now()}`;
    const payload = JSON.stringify({
      id: eventId,
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      resource: { id: 'cap-123' },
    });

    const first = await webhookUseCase.execute({
      headers: { 'paypal-auth-algo': 'SHA256withRSA' },
      rawBody: payload,
    });
    expect(first.duplicate).toBe(false);

    const second = await webhookUseCase.execute({
      headers: { 'paypal-auth-algo': 'SHA256withRSA' },
      rawBody: payload,
    });
    expect(second.duplicate).toBe(true);
  });
});

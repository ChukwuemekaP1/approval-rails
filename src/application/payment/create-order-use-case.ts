import { randomUUID } from 'crypto';
import { authorizationService } from '@/application/auth/authorization-service';
import { proposalRepo, ProposalRepository } from '@/infrastructure/repositories/proposal-repository';
import { orderRepository, OrderRepository } from '@/infrastructure/repositories/order-repository';
import { payPalAdapter } from '@/infrastructure/paypal/paypal-adapter';
import { PaymentGatewayPort } from './payment-ports';
import { Order } from '@/domain/payment/types';
import {
  UnauthorizedPaymentActionError,
  DuplicateOrderError,
  InvalidPaymentStateError,
} from '@/domain/payment/errors';
import { getEnv } from '@/infrastructure/config/env';
import { recordLedgerEventSafe } from '@/application/ledger/record-ledger-event';

export interface CreateOrderCommand {
  principalId: string;
  workspaceId: string;
  proposalId: string;
}

export class CreateOrderUseCase {
  constructor(
    private readonly proposalRepository: ProposalRepository = proposalRepo,
    private readonly orderRepo: OrderRepository = orderRepository,
    private readonly gateway: PaymentGatewayPort = payPalAdapter
  ) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    const { principalId, workspaceId, proposalId } = command;

    const membership = await authorizationService.authorizeWorkspace(principalId, workspaceId);

    const proposal = await this.proposalRepository.getById(proposalId, workspaceId);
    if (!proposal || proposal.workspaceId !== workspaceId) {
      throw new UnauthorizedPaymentActionError('Proposal not found in authorized workspace');
    }

    if (proposal.requesterId !== principalId && membership.role !== 'ADMIN') {
      throw new UnauthorizedPaymentActionError(
        'Mandate does not belong to principal and caller lacks ADMIN role (SEC-01)'
      );
    }

    if (proposal.status !== 'AUTHORIZED') {
      throw new InvalidPaymentStateError(
        `Proposal must be in AUTHORIZED status; current status: ${proposal.status}`
      );
    }

    if (new Date() > proposal.expiresAt) {
      throw new InvalidPaymentStateError('Proposal mandate has expired');
    }

    if (!proposal.policyEvaluation.passed) {
      throw new InvalidPaymentStateError('Proposal terms violate active spend policy');
    }

    const existing = await this.orderRepo.findByProposalId(proposalId);
    if (existing) {
      throw new DuplicateOrderError(proposalId);
    }

    const orderId = randomUUID();
    const idempotencyKey = `ord_${orderId}`;
    const env = getEnv();
    const returnUrl = `${env.APP_URL}/app/orders/${orderId}?status=success`;
    const cancelUrl = `${env.APP_URL}/app/orders/${orderId}?status=cancelled`;

    const ppOrder = await this.gateway.createOrder(
      {
        referenceId: orderId,
        amountMinor: proposal.totalAmountMinor,
        currency: proposal.currency,
        merchant: proposal.merchant,
        description: `ApproveRail Mandate for ${proposal.merchant}`,
        returnUrl,
        cancelUrl,
      },
      idempotencyKey
    );

    const now = new Date();
    const newOrder: Order = {
      id: orderId,
      workspaceId,
      principalId,
      proposalId,
      paypalOrderId: ppOrder.paypalOrderId,
      status: 'APPROVAL_PENDING',
      intent: 'CAPTURE',
      currency: proposal.currency,
      amountMinor: proposal.totalAmountMinor,
      merchant: proposal.merchant,
      idempotencyKey,
      approvalUrl: ppOrder.approvalUrl,
      captureId: null,
      capturedAt: null,
      failureReason: null,
      reconciledAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.orderRepo.create(newOrder);

    await recordLedgerEventSafe({
      workspaceId,
      streamId: orderId,
      correlationId: proposal.sourceRequestId || orderId,
      eventType: 'ORDER_CREATED',
      actor: { kind: 'USER', id: principalId },
      payload: {
        orderId,
        proposalId,
        paypalOrderId: ppOrder.paypalOrderId,
        amountMinor: proposal.totalAmountMinor.toString(),
        currency: proposal.currency,
        merchant: proposal.merchant,
      },
    });

    return created;
  }
}

export const createOrderUseCase = new CreateOrderUseCase();

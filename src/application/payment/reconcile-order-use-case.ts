import { authorizationService } from '@/application/auth/authorization-service';
import { orderRepository, OrderRepository } from '@/infrastructure/repositories/order-repository';
import { payPalAdapter } from '@/infrastructure/paypal/paypal-adapter';
import { PaymentGatewayPort } from './payment-ports';
import { Order } from '@/domain/payment/types';
import { OrderNotFoundError, UnauthorizedPaymentActionError } from '@/domain/payment/errors';
import { baseLogger } from '@/infrastructure/logging/logger';
import { recordLedgerEventSafe } from '@/application/ledger/record-ledger-event';

export class ReconcileOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepository = orderRepository,
    private readonly gateway: PaymentGatewayPort = payPalAdapter
  ) {}

  async execute(orderId: string, principalId: string, workspaceId: string): Promise<Order> {
    const membership = await authorizationService.authorizeWorkspace(principalId, workspaceId);

    const order = await this.orderRepo.findById(orderId);
    if (!order || order.workspaceId !== workspaceId) {
      throw new OrderNotFoundError(orderId);
    }

    if (order.principalId !== principalId && membership.role !== 'ADMIN') {
      throw new UnauthorizedPaymentActionError('Unauthorized to reconcile this order');
    }

    baseLogger.info({ orderId, status: order.status }, 'Reconciling order with PayPal');
    const ppOrder = await this.gateway.getOrder(order.paypalOrderId);

    const now = new Date();
    const updated = await this.orderRepo.updateStatus(order.id, ppOrder.status === 'COMPLETED' ? 'COMPLETED' : ppOrder.status === 'VOIDED' || ppOrder.status === 'FAILED' ? 'FAILED' : ppOrder.status === 'APPROVED' ? 'APPROVAL_PENDING' : order.status, {
      reconciledAt: now,
      ...(ppOrder.status === 'VOIDED' || ppOrder.status === 'FAILED' ? { failureReason: `Reconciled as ${ppOrder.status} from PayPal` } : {}),
    });

    await recordLedgerEventSafe({
      workspaceId,
      streamId: order.id,
      correlationId: order.id,
      eventType: 'RECONCILIATION_COMPLETED',
      actor: { kind: 'SYSTEM', id: 'reconciler' },
      payload: { orderId: order.id, previousStatus: order.status, reconciledStatus: ppOrder.status },
    });

    return updated;
  }
}

export const reconcileOrderUseCase = new ReconcileOrderUseCase();

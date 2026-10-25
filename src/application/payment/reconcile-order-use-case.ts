import { authorizationService } from '@/application/auth/authorization-service';
import { orderRepository, OrderRepository } from '@/infrastructure/repositories/order-repository';
import { payPalAdapter } from '@/infrastructure/paypal/paypal-adapter';
import { PaymentGatewayPort } from './payment-ports';
import { Order } from '@/domain/payment/types';
import { OrderNotFoundError, UnauthorizedPaymentActionError } from '@/domain/payment/errors';
import { baseLogger } from '@/infrastructure/logging/logger';

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
    if (ppOrder.status === 'COMPLETED') {
      return await this.orderRepo.updateStatus(order.id, 'COMPLETED', {
        reconciledAt: now,
      });
    }

    if (ppOrder.status === 'VOIDED' || ppOrder.status === 'FAILED') {
      return await this.orderRepo.updateStatus(order.id, 'FAILED', {
        reconciledAt: now,
        failureReason: `Reconciled as ${ppOrder.status} from PayPal`,
      });
    }

    if (ppOrder.status === 'APPROVED') {
      return await this.orderRepo.updateStatus(order.id, 'APPROVAL_PENDING', {
        reconciledAt: now,
      });
    }

    return await this.orderRepo.updateStatus(order.id, order.status, {
      reconciledAt: now,
    });
  }
}

export const reconcileOrderUseCase = new ReconcileOrderUseCase();

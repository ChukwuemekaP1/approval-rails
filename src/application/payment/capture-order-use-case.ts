import { authorizationService } from '@/application/auth/authorization-service';
import { orderRepository, OrderRepository } from '@/infrastructure/repositories/order-repository';
import { payPalAdapter } from '@/infrastructure/paypal/paypal-adapter';
import { PaymentGatewayPort } from './payment-ports';
import { Order } from '@/domain/payment/types';
import {
  UnauthorizedPaymentActionError,
  OrderNotFoundError,
  InvalidPaymentStateError,
  PayPalTimeoutError,
} from '@/domain/payment/errors';
import { assertValidPaymentTransition } from '@/domain/payment/state-machine';
import { baseLogger } from '@/infrastructure/logging/logger';

export interface CaptureOrderCommand {
  principalId: string;
  workspaceId: string;
  orderId: string;
}

export class CaptureOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepository = orderRepository,
    private readonly gateway: PaymentGatewayPort = payPalAdapter
  ) {}

  async execute(command: CaptureOrderCommand): Promise<Order> {
    const { principalId, workspaceId, orderId } = command;

    const membership = await authorizationService.authorizeWorkspace(principalId, workspaceId);

    const order = await this.orderRepo.findById(orderId);
    if (!order || order.workspaceId !== workspaceId) {
      throw new OrderNotFoundError(orderId);
    }

    if (order.principalId !== principalId && membership.role !== 'ADMIN') {
      throw new UnauthorizedPaymentActionError(
        'Order does not belong to principal and caller lacks ADMIN role (SEC-02)'
      );
    }

    if (order.status === 'COMPLETED') {
      return order;
    }

    assertValidPaymentTransition(order.status, 'CAPTURE_PENDING');

    await this.orderRepo.updateStatus(order.id, 'CAPTURE_PENDING');

    const captureKey = `cap_${order.id}_${Date.now()}`;

    try {
      const result = await this.gateway.captureOrder(order.paypalOrderId, captureKey);

      return await this.orderRepo.updateStatus(order.id, 'COMPLETED', {
        captureId: result.captureId,
        capturedAt: new Date(),
      });
    } catch (err: any) {
      if (err instanceof PayPalTimeoutError || err.name === 'PayPalTimeoutError') {
        baseLogger.warn({ orderId }, 'Outbound capture timed out; setting state to UNKNOWN');
        return await this.orderRepo.updateStatus(order.id, 'UNKNOWN', {
          failureReason: 'Capture request timed out. Awaiting reconciliation.',
        });
      }

      baseLogger.error({ orderId, err: err.message }, 'PayPal capture failed');
      return await this.orderRepo.updateStatus(order.id, 'FAILED', {
        failureReason: err.details?.message || err.message || 'Capture declined',
      });
    }
  }
}

export const captureOrderUseCase = new CaptureOrderUseCase();

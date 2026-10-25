import { orderRepository, OrderRepository } from '@/infrastructure/repositories/order-repository';
import { payPalAdapter } from '@/infrastructure/paypal/paypal-adapter';
import { PaymentGatewayPort } from './payment-ports';
import { WebhookSignatureVerificationError } from '@/domain/payment/errors';
import { baseLogger } from '@/infrastructure/logging/logger';
import { getEnv } from '@/infrastructure/config/env';

export interface WebhookCommand {
  headers: Record<string, string>;
  rawBody: string;
}

export interface WebhookResult {
  processed: boolean;
  duplicate: boolean;
  eventId?: string;
  eventType?: string;
}

export class PayPalWebhookUseCase {
  constructor(
    private readonly orderRepo: OrderRepository = orderRepository,
    private readonly gateway: PaymentGatewayPort = payPalAdapter
  ) {}

  async execute(command: WebhookCommand): Promise<WebhookResult> {
    const { headers, rawBody } = command;
    const env = getEnv();

    const webhookId =
      env.PAYPAL_WEBHOOK_ID || (env.NODE_ENV === 'test' ? 'test-webhook-id' : undefined);
    if (!webhookId) {
      baseLogger.error('PAYPAL_WEBHOOK_ID is not configured');
      if (env.NODE_ENV === 'production') {
        const err = new Error('Webhook configuration missing');
        (err as any).status = 503;
        throw err;
      }
    }

    if (webhookId) {
      const isValid = await this.gateway.verifyWebhookSignature({
        headers,
        rawBody,
        webhookId,
      });

      if (!isValid) {
        throw new WebhookSignatureVerificationError('PayPal signature verification failed');
      }
    }

    const event = JSON.parse(rawBody);
    const eventId = event.id;
    const eventType = event.event_type;

    const inserted = await this.orderRepo.saveWebhookEvent({
      eventId,
      eventType,
      resourceType: event.resource_type || 'UNKNOWN',
      summary: event.summary,
      rawPayload: rawBody,
    });

    if (!inserted) {
      baseLogger.info({ eventId }, 'Webhook event already processed (idempotent duplicate)');
      return { processed: true, duplicate: true, eventId, eventType };
    }

    await this.processEvent(eventType, event.resource);
    await this.orderRepo.markWebhookProcessed(eventId);

    return { processed: true, duplicate: false, eventId, eventType };
  }

  private async processEvent(eventType: string, resource: any): Promise<void> {
    const paypalOrderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
    if (!paypalOrderId) return;

    const order = await this.orderRepo.findByPayPalOrderId(paypalOrderId);
    if (!order) return;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' && order.status !== 'COMPLETED') {
      await this.orderRepo.updateStatus(order.id, 'COMPLETED', {
        captureId: resource.id,
        capturedAt: new Date(),
      });
    } else if (eventType === 'PAYMENT.CAPTURE.DENIED' && order.status !== 'FAILED') {
      await this.orderRepo.updateStatus(order.id, 'FAILED', {
        failureReason: resource.status_details?.reason || 'Capture denied by PayPal',
      });
    }
  }
}

export const payPalWebhookUseCase = new PayPalWebhookUseCase();

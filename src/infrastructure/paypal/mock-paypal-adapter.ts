import {
  PaymentGatewayPort,
  CreatePayPalOrderInput,
  CreatePayPalOrderOutput,
  CapturePayPalOrderOutput,
  VerifyWebhookInput,
} from '@/application/payment/payment-ports';
import { PayPalTimeoutError } from '@/domain/payment/errors';

export class MockPayPalAdapter implements PaymentGatewayPort {
  public simulateTimeout = false;
  public simulateFailure = false;
  public simulateInvalidWebhook = false;
  public orders = new Map<string, any>();

  async createOrder(
    input: CreatePayPalOrderInput,
    _idempotencyKey: string
  ): Promise<CreatePayPalOrderOutput> {
    const id = `MOCK-ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const mockOrder = {
      id,
      status: 'CREATED',
      referenceId: input.referenceId,
      amountMinor: input.amountMinor,
      currency: input.currency,
      merchant: input.merchant,
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${id}`,
    };
    this.orders.set(id, mockOrder);
    return {
      paypalOrderId: id,
      status: 'CREATED',
      approvalUrl: mockOrder.approvalUrl,
    };
  }

  async captureOrder(
    paypalOrderId: string,
    _idempotencyKey: string
  ): Promise<CapturePayPalOrderOutput> {
    if (this.simulateTimeout) {
      throw new PayPalTimeoutError('Simulated PayPal network timeout');
    }
    if (this.simulateFailure) {
      const err = new Error('PayPal API error: HTTP 422');
      (err as any).status = 422;
      (err as any).details = { issue: 'PAYMENT_SOURCE_DECLINED' };
      throw err;
    }

    const order = this.orders.get(paypalOrderId) || { id: paypalOrderId };
    order.status = 'COMPLETED';
    this.orders.set(paypalOrderId, order);

    return {
      paypalOrderId,
      captureId: `MOCK-CAP-${Date.now()}`,
      status: 'COMPLETED',
      rawResponse: { id: paypalOrderId, status: 'COMPLETED' },
    };
  }

  async getOrder(paypalOrderId: string): Promise<{
    paypalOrderId: string;
    status: string;
    rawResponse: Record<string, unknown>;
  }> {
    const order = this.orders.get(paypalOrderId);
    return {
      paypalOrderId,
      status: order?.status || 'COMPLETED',
      rawResponse: order || { id: paypalOrderId, status: 'COMPLETED' },
    };
  }

  async verifyWebhookSignature(_input: VerifyWebhookInput): Promise<boolean> {
    if (this.simulateInvalidWebhook) return false;
    return true;
  }
}

export const mockPayPalAdapter = new MockPayPalAdapter();

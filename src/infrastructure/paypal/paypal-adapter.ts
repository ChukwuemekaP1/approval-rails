import { formatMinorUnitsToDecimal } from '@/domain/money/currency';
import {
  PaymentGatewayPort,
  CreatePayPalOrderInput,
  CreatePayPalOrderOutput,
  CapturePayPalOrderOutput,
  VerifyWebhookInput,
} from '@/application/payment/payment-ports';
import { payPalClient, PayPalClient } from './paypal-client';
import { baseLogger } from '@/infrastructure/logging/logger';

export class PayPalAdapter implements PaymentGatewayPort {
  constructor(private readonly client: PayPalClient = payPalClient) {}

  async createOrder(
    input: CreatePayPalOrderInput,
    idempotencyKey: string
  ): Promise<CreatePayPalOrderOutput> {
    const value = formatMinorUnitsToDecimal(input.amountMinor, input.currency);
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: input.referenceId,
          description: input.description.slice(0, 127),
          amount: {
            currency_code: input.currency,
            value,
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
            user_action: 'PAY_NOW',
          },
        },
      },
    };

    const data = await this.client.request<any>('/v2/checkout/orders', {
      method: 'POST',
      headers: { 'PayPal-Request-Id': idempotencyKey },
      body: payload,
    });

    const approveLink = data.links?.find((l: any) => l.rel === 'payer-action' || l.rel === 'approve');
    return {
      paypalOrderId: data.id,
      status: data.status,
      approvalUrl: approveLink?.href || '',
    };
  }

  async captureOrder(
    paypalOrderId: string,
    idempotencyKey: string
  ): Promise<CapturePayPalOrderOutput> {
    const data = await this.client.request<any>(
      `/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: { 'PayPal-Request-Id': idempotencyKey },
      }
    );

    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    return {
      paypalOrderId: data.id,
      captureId: capture?.id || '',
      status: data.status,
      rawResponse: data,
    };
  }

  async getOrder(paypalOrderId: string): Promise<{
    paypalOrderId: string;
    status: string;
    rawResponse: Record<string, unknown>;
  }> {
    const data = await this.client.request<any>(
      `/v2/checkout/orders/${paypalOrderId}`
    );
    return {
      paypalOrderId: data.id,
      status: data.status,
      rawResponse: data,
    };
  }

  async verifyWebhookSignature(input: VerifyWebhookInput): Promise<boolean> {
    const { headers, rawBody, webhookId } = input;
    const authAlgo = headers['paypal-auth-algo'];
    const certUrl = headers['paypal-cert-url'];
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const transmissionTime = headers['paypal-transmission-time'];

    if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
      baseLogger.warn('Missing PayPal webhook verification headers');
      return false;
    }

    try {
      const parsedBody = JSON.parse(rawBody);
      const res = await this.client.request<any>(
        '/v1/notifications/verify-webhook-signature',
        {
          method: 'POST',
          body: {
            auth_algo: authAlgo,
            cert_url: certUrl,
            transmission_id: transmissionId,
            transmission_sig: transmissionSig,
            transmission_time: transmissionTime,
            webhook_id: webhookId,
            webhook_event: parsedBody,
          },
        }
      );
      return res.verification_status === 'SUCCESS';
    } catch (err: any) {
      baseLogger.error({ err: err.message }, 'Failed verifying webhook signature');
      return false;
    }
  }
}

export const payPalAdapter = new PayPalAdapter();

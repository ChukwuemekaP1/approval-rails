import { CurrencyCode } from '@/domain/money/currency';

export interface CreatePayPalOrderInput {
  referenceId: string;
  amountMinor: bigint;
  currency: CurrencyCode;
  merchant: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreatePayPalOrderOutput {
  paypalOrderId: string;
  status: string;
  approvalUrl: string;
}

export interface CapturePayPalOrderOutput {
  paypalOrderId: string;
  captureId: string;
  status: string;
  rawResponse: Record<string, unknown>;
}

export interface VerifyWebhookInput {
  headers: Record<string, string>;
  rawBody: string;
  webhookId: string;
}

export interface PaymentGatewayPort {
  createOrder(
    input: CreatePayPalOrderInput,
    idempotencyKey: string
  ): Promise<CreatePayPalOrderOutput>;

  captureOrder(
    paypalOrderId: string,
    idempotencyKey: string
  ): Promise<CapturePayPalOrderOutput>;

  getOrder(
    paypalOrderId: string
  ): Promise<{
    paypalOrderId: string;
    status: string;
    rawResponse: Record<string, unknown>;
  }>;

  verifyWebhookSignature(input: VerifyWebhookInput): Promise<boolean>;
}

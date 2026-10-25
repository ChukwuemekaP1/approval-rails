export class PaymentError extends Error {
  constructor(message: string, public readonly code: string = 'PAYMENT_ERROR') {
    super(message);
    this.name = 'PaymentError';
  }
}

export class OrderNotFoundError extends PaymentError {
  constructor(orderId: string) {
    super(`Order with ID ${orderId} not found`, 'ORDER_NOT_FOUND');
    this.name = 'OrderNotFoundError';
  }
}

export class UnauthorizedPaymentActionError extends PaymentError {
  constructor(message: string = 'Unauthorized payment operation') {
    super(message, 'UNAUTHORIZED_PAYMENT_ACTION');
    this.name = 'UnauthorizedPaymentActionError';
  }
}

export class DuplicateOrderError extends PaymentError {
  constructor(proposalId: string) {
    super(`Order already exists for proposal ${proposalId}`, 'DUPLICATE_ORDER');
    this.name = 'DuplicateOrderError';
  }
}

export class InvalidPaymentStateError extends PaymentError {
  constructor(message: string) {
    super(message, 'INVALID_PAYMENT_STATE');
    this.name = 'InvalidPaymentStateError';
  }
}

export class PayPalTimeoutError extends PaymentError {
  constructor(message: string = 'PayPal communication timed out during operation') {
    super(message, 'PAYPAL_TIMEOUT');
    this.name = 'PayPalTimeoutError';
  }
}

export class WebhookSignatureVerificationError extends PaymentError {
  constructor(message: string = 'Invalid PayPal webhook signature') {
    super(message, 'WEBHOOK_SIGNATURE_INVALID');
    this.name = 'WebhookSignatureVerificationError';
  }
}

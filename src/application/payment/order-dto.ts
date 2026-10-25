import { formatMinorUnitsToDecimal, CurrencyCode } from '@/domain/money/currency';
import { Order, PaymentStatus } from '@/domain/payment/types';

export interface OrderDTO {
  id: string;
  workspaceId: string;
  principalId: string;
  proposalId: string;
  paypalOrderId: string;
  status: PaymentStatus;
  intent: 'CAPTURE';
  currency: CurrencyCode;
  amount: string;
  amountMinor: string;
  merchant: string;
  approvalUrl: string | null;
  captureId: string | null;
  capturedAt: string | null;
  failureReason: string | null;
  reconciledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function formatOrderToDTO(order: Order): OrderDTO {
  return {
    id: order.id,
    workspaceId: order.workspaceId,
    principalId: order.principalId,
    proposalId: order.proposalId,
    paypalOrderId: order.paypalOrderId,
    status: order.status,
    intent: order.intent,
    currency: order.currency,
    amount: formatMinorUnitsToDecimal(order.amountMinor, order.currency),
    amountMinor: order.amountMinor.toString(),
    merchant: order.merchant,
    approvalUrl: order.approvalUrl,
    captureId: order.captureId,
    capturedAt: order.capturedAt ? order.capturedAt.toISOString() : null,
    failureReason: order.failureReason,
    reconciledAt: order.reconciledAt ? order.reconciledAt.toISOString() : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

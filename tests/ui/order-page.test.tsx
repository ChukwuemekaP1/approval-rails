import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { OrderStatusBadge } from '@/ui/components/order/OrderStatusBadge';
import { OrderActions } from '@/ui/components/order/OrderActions';
import { OrderDTO } from '@/application/payment/order-dto';

describe('Order & Settlement UI Components', () => {
  it('renders appropriate status badges for payment states', () => {
    const { rerender } = render(<OrderStatusBadge status="COMPLETED" />);
    expect(screen.getByText(/Captured & Completed/i)).toBeInTheDocument();

    rerender(<OrderStatusBadge status="APPROVAL_PENDING" />);
    expect(screen.getByText(/Awaiting PayPal Approval/i)).toBeInTheDocument();

    rerender(<OrderStatusBadge status="UNKNOWN" />);
    expect(screen.getByText(/Ambiguous State/i)).toBeInTheDocument();

    rerender(<OrderStatusBadge status="FAILED" />);
    expect(screen.getByText(/Payment Failed/i)).toBeInTheDocument();
  });

  it('renders checkout approval link and capture button in approval pending state', () => {
    const mockOrder: OrderDTO = {
      id: 'ord-123',
      workspaceId: 'ws-123',
      principalId: 'p-123',
      proposalId: 'prop-123',
      paypalOrderId: 'PP-123',
      status: 'APPROVAL_PENDING',
      intent: 'CAPTURE',
      currency: 'USD',
      amount: '99.00',
      amountMinor: '9900',
      merchant: 'Acme Test',
      approvalUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=PP-123',
      captureId: null,
      capturedAt: null,
      failureReason: null,
      reconciledAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <OrderActions
        order={mockOrder}
        isCapturing={false}
        isReconciling={false}
        onCapture={vi.fn()}
        onReconcile={vi.fn()}
      />
    );

    expect(screen.getByText(/Proceed to PayPal Sandbox Checkout/i)).toBeInTheDocument();
    expect(screen.getByText(/Capture Approved Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/No card or banking details are collected or stored/i)).toBeInTheDocument();
  });
});

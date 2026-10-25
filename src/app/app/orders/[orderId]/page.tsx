import React from 'react';
import { RoutePlaceholder } from '@/ui/components/RoutePlaceholder';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <RoutePlaceholder
      title={`PayPal Order Status: ${orderId}`}
      routePath={`/app/orders/${orderId}`}
      targetPhase="Phase 6: PayPal Settlement"
      description="Handles PayPal checkout handoff, approval redirection, and accurate payment capture status. Shows authoritative order and capture lifecycle states."
      securityInvariantsNote="All payment state transitions are explicit: UNKNOWN is never treated as COMPLETED (Invariant 8). Payment creation and capture operations are strictly idempotent with unique keys (Invariant 9)."
      nextSteps={[
        'Initialize PayPal v2 Order from persisted canonical terms',
        'Present PayPal approval window / SDK handoff',
        'Capture approved order with idempotency checks and timeout reconciliation',
      ]}
    />
  );
}

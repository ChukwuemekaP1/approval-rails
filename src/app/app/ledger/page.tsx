import React from 'react';
import { RoutePlaceholder } from '@/ui/components/RoutePlaceholder';

export default function LedgerPage() {
  return (
    <RoutePlaceholder
      title="Operational Ledger & Audit Timeline"
      routePath="/app/ledger"
      targetPhase="Phase 7: Evidence & Operational Ledger"
      description="Operational ledger table powered by AG Grid Community and sequential timeline. Displays every proposal, policy evaluation, human consent seal, order creation, capture, and webhook event."
      securityInvariantsNote="Append-only tamper-evident model with cryptographic SHA-256 chain pointers (Invariant 11). Outbound notifications are decoupled via transactional outbox and cannot alter ledger integrity (Invariant 14)."
      nextSteps={[
        'Integrate AG Grid Community with column filtering and sorting',
        'Visual sequence verification of cryptographic SHA-256 event chain',
        'Export ledger slice as verifiable JSON evidence bundle',
      ]}
    />
  );
}

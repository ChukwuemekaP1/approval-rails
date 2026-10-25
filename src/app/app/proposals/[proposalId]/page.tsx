import React from 'react';
import { RoutePlaceholder } from '@/ui/components/RoutePlaceholder';

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;

  return (
    <RoutePlaceholder
      title={`Proposal Review: ${proposalId}`}
      routePath={`/app/proposals/${proposalId}`}
      targetPhase="Phase 5: Proposal Review & Sealing"
      description="The central consent interface. Displays editable unsigned basket line items, unit prices in integer minor units, deterministic evaluation against the active policy, and the cryptographic passkey seal trigger."
      securityInvariantsNote="Human authorization is bound to the exact canonical purchase terms (Invariant 7). Any edit (quantity, item, merchant) recalculates the canonical terms hash and invalidates any previous authorization. Floating point representation is strictly prohibited (Invariant 5)."
      nextSteps={[
        'Display authoritative line items and totals calculated on server',
        'Deterministic active policy evaluation outcome banner',
        'Term sealing mechanism producing canonical SHA-256 terms hash',
        'WebAuthn user passkey assertion bound cryptographically to terms hash',
      ]}
    />
  );
}

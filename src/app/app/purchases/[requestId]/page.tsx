import React from 'react';
import { RoutePlaceholder } from '@/ui/components/RoutePlaceholder';

export default async function PurchaseRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  return (
    <RoutePlaceholder
      title={`Purchase Request: ${requestId}`}
      routePath={`/app/purchases/${requestId}`}
      targetPhase="Phase 4: Discovery & Research"
      description="Displays the status of the purchase request, discovered catalog candidates from Channel3, side-by-side merchant price comparison, and candidate selection for proposal basket generation."
      securityInvariantsNote="Product candidates maintain source facts and observed timestamps. Calculations of proposed totals are performed on the server; client-provided prices or modifications are never accepted (Invariant 4)."
      nextSteps={[
        'Display safe catalog candidate snapshot',
        'Side-by-side spec and price comparison matrix',
        'Interactive item selection to initialize proposed basket',
      ]}
    />
  );
}

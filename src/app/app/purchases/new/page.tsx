import React from 'react';
import { RoutePlaceholder } from '@/ui/components/RoutePlaceholder';

export default function NewPurchaseRequestPage() {
  return (
    <RoutePlaceholder
      title="Create Purchase Request"
      routePath="/app/purchases/new"
      targetPhase="Phase 4: Discovery & Research"
      description="Allows users to specify purchasing needs, desired brands, constraints, and integer minor unit budgets in ordinary language. The constrained Gemini assistant and Channel3 adapter will retrieve actual catalog candidates and source facts."
      securityInvariantsNote="AI output is strictly untrusted data (Invariant 2). The AI assists with catalog extraction and candidate ranking, but has zero access to payment credentials and cannot authorize purchases (Invariant 1)."
      nextSteps={[
        'Accept prompt and budget constraints via Zod-validated input schema',
        'Channel3 catalog candidate lookup and source fact retrieval',
        'Constrained Gemini summarization with JSON structured output',
        'Safe candidate snapshot storage in product_candidates table',
      ]}
    />
  );
}

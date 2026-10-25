import React from 'react';
import { RoutePlaceholder } from '@/ui/components/RoutePlaceholder';

export default function PoliciesPage() {
  return (
    <RoutePlaceholder
      title="Spend Policies & Rules"
      routePath="/app/policies"
      targetPhase="Phase 3: Policy Engine"
      description="View the active spend policy, inspect historical immutable versions, and author new policy revisions. Policies enforce spend caps, category restrictions, required approver roles, and merchant allowlists."
      securityInvariantsNote="Persist policy versions and use the authoritative active policy from the database (Invariant 6). A client cannot inject or substitute an arbitrary policy into proposal requests."
      nextSteps={[
        'Display active policy rules and version number',
        'Inspect immutable version history and rule diffs',
        'Policy editor with Zod-based rule validation and version publishing',
      ]}
    />
  );
}

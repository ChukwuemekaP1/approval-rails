import React from 'react';
import { RoutePlaceholder } from '@/ui/components/RoutePlaceholder';

export default function SettingsPage() {
  return (
    <RoutePlaceholder
      title="Settings & Security"
      routePath="/app/settings"
      targetPhase="Phase 2 & 7: Account & Notifications"
      description="Manage registered WebAuthn passkeys, active sessions, Zapier outbound notification webhook endpoints, and currency display preferences."
      securityInvariantsNote="Secrets are server-only and validated at startup (Invariant 12). Webhook notifications run asynchronously from an outbox and never block or alter payment flow (Invariant 14)."
      nextSteps={[
        'List and register backup WebAuthn passkeys',
        'Configure asynchronous Zapier outbound webhook URL',
        'Session revocation and active sign-in overview',
      ]}
    />
  );
}

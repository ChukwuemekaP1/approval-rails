'use client';

import React from 'react';

export interface WebhookEventState {
  proposal: boolean;
  policy: boolean;
  payment: boolean;
  failed: boolean;
  recon: boolean;
}

interface Props {
  events: WebhookEventState;
  setEvents: React.Dispatch<React.SetStateAction<WebhookEventState>>;
}

export function WebhookEventToggles({ events, setEvents }: Props) {
  const toggle = (key: keyof WebhookEventState) =>
    setEvents((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-2 pt-2 border-t">
      <span className="font-semibold text-gray-700 dark:text-gray-300 block">Subscribed Event Types:</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={events.proposal} onChange={() => toggle('proposal')} />
          PROPOSAL_READY_FOR_REVIEW
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={events.policy} onChange={() => toggle('policy')} />
          POLICY_DENIED
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={events.payment} onChange={() => toggle('payment')} />
          PAYMENT_COMPLETED
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={events.failed} onChange={() => toggle('failed')} />
          PAYMENT_FAILED
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={events.recon} onChange={() => toggle('recon')} />
          PAYMENT_RECONCILIATION_REQUIRED
        </label>
      </div>
    </div>
  );
}

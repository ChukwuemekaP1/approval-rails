'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface Props {
  isConfigured: boolean;
  enabled: boolean;
}

export function WebhookStatusHeader({ isConfigured, enabled }: Props) {
  const badgeClass =
    isConfigured && enabled
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : !isConfigured
      ? 'bg-gray-100 text-gray-600'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  const label =
    isConfigured && enabled ? 'Active & Connected' : !isConfigured ? 'Not Configured' : 'Disabled';

  return (
    <div className="flex items-center justify-between border-b pb-3">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-sky-600" />
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">
          Zapier Webhook Notification Outbox
        </h2>
      </div>
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClass}`}>
        {label}
      </span>
    </div>
  );
}

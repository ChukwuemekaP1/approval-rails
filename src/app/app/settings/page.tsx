'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/ui/context/AuthContext';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';
import { WebhookSettingsForm } from '@/ui/components/settings/WebhookSettingsForm';
import { OutboxDeliveryHistory, DeliveryLogItem } from '@/ui/components/settings/OutboxDeliveryHistory';

export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading, activeWorkspace } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [history, setHistory] = useState<DeliveryLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setIsLoading(true);
    try {
      const [settingsRes, historyRes] = await Promise.all([
        fetch(`/api/v1/workspaces/${activeWorkspace.id}/notifications/settings`),
        fetch(`/api/v1/workspaces/${activeWorkspace.id}/notifications/history`),
      ]);
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setSettings(s.settings);
      }
      if (historyRes.ok) {
        const h = await historyRes.json();
        setHistory(h.history || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (isAuthenticated && activeWorkspace?.id) {
      loadData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeWorkspace?.id, authLoading, loadData]);

  if (authLoading || (isAuthenticated && isLoading && !settings)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-7 h-7 text-sky-600 animate-spin" />
        <p className="text-xs text-gray-500">Loading settings...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border rounded-xl text-center space-y-3">
        <Lock className="w-8 h-8 text-sky-600 mx-auto" />
        <p className="text-sm font-bold text-gray-900">Sign in to manage workspace settings.</p>
        <Link href="/auth" className="inline-block px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  if (!activeWorkspace?.id) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border rounded-xl text-center space-y-3">
        <p className="text-sm font-bold text-gray-900">Please select an active workspace to view settings.</p>
        <Link href="/app/workspaces" className="inline-block px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold">
          Select Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="border-b pb-4">
        <span className="text-[11px] font-bold text-sky-600 uppercase">Notifications & Webhook Outbox</span>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Workspace Settings & Integrations</h1>
        <p className="text-xs text-gray-500">Manage asynchronous Zapier webhook notifications and delivery reliability.</p>
      </div>

      <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-xl p-4 flex items-start gap-3 text-xs text-sky-900 dark:text-sky-200">
        <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Security Invariant (Advisory Webhook Dispatch):</span>
          <p className="text-[11px] text-sky-800 dark:text-sky-300 mt-0.5">
            External notifications are strictly advisory. Webhook payloads are minimized and scrubbed of secrets or passkeys. Webhook outages cannot block or roll back payment capture.
          </p>
        </div>
      </div>

      <WebhookSettingsForm
        workspaceId={activeWorkspace!.id}
        initialSettings={settings}
        onSaved={loadData}
        onTestDispatched={loadData}
      />

      <OutboxDeliveryHistory
        history={history}
        onRefresh={loadData}
        isLoading={isLoading}
      />
    </div>
  );
}

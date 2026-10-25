'use client';

import React, { useState } from 'react';
import { Send, Check, AlertCircle, Loader2 } from 'lucide-react';
import { WebhookStatusHeader } from './WebhookStatusHeader';
import { WebhookEventToggles, WebhookEventState } from './WebhookEventToggles';

interface Props {
  workspaceId: string;
  initialSettings: any;
  onSaved: () => void;
  onTestDispatched: () => void;
}

export function WebhookSettingsForm({
  workspaceId,
  initialSettings,
  onSaved,
  onTestDispatched,
}: Props) {
  const [url, setUrl] = useState(initialSettings?.maskedWebhookUrl || '');
  const [enabled, setEnabled] = useState(initialSettings?.enabled ?? true);
  const [events, setEvents] = useState<WebhookEventState>({
    proposal: initialSettings?.notifyProposalReady ?? true,
    policy: initialSettings?.notifyPolicyDenied ?? true,
    payment: initialSettings?.notifyPaymentCompleted ?? true,
    failed: initialSettings?.notifyPaymentFailed ?? true,
    recon: initialSettings?.notifyReconciliation ?? true,
  });

  const [busy, setBusy] = useState<{ save?: boolean; test?: boolean }>({});
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy({ save: true });
    setFeedback(null);
    try {
      const payload: any = {
        enabled,
        notifyProposalReady: events.proposal,
        notifyPolicyDenied: events.policy,
        notifyPaymentCompleted: events.payment,
        notifyPaymentFailed: events.failed,
        notifyReconciliation: events.recon,
      };
      if (url && !url.includes('***')) payload.zapierWebhookUrl = url;

      const res = await fetch(`/api/v1/workspaces/${workspaceId}/notifications/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      setFeedback({ ok: true, msg: 'Settings saved' });
      onSaved();
    } catch (err: any) {
      setFeedback({ ok: false, msg: err.message });
    } finally {
      setBusy({});
    }
  };

  const handleTestPing = async () => {
    setBusy({ test: true });
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/notifications/test`, { method: 'POST' });
      const data = await res.json();
      setFeedback({
        ok: Boolean(data.success),
        msg: data.success ? `Delivered (HTTP ${data.httpStatus || 200})` : data.error || 'Failed',
      });
      onTestDispatched();
    } catch (err: any) {
      setFeedback({ ok: false, msg: err.message });
    } finally {
      setBusy({});
    }
  };

  const isConfigured = Boolean(initialSettings?.hasWebhookUrl);

  return (
    <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 space-y-4">
      <WebhookStatusHeader isConfigured={isConfigured} enabled={enabled} />

      {feedback && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${feedback.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {feedback.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Zapier Webhook URL (Secret)</label>
          <input
            type="text"
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-sky-500 bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="rounded text-sky-600 focus:ring-sky-500"
          />
          Enable outbound webhook notifications
        </label>

        <WebhookEventToggles events={events} setEvents={setEvents} />

        <div className="flex items-center justify-between pt-3 border-t">
          <button
            type="button"
            onClick={handleTestPing}
            disabled={busy.test || !isConfigured}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border rounded-lg font-semibold text-gray-700 disabled:opacity-50"
          >
            {busy.test ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send Test Ping
          </button>
          <button
            type="submit"
            disabled={busy.save}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg disabled:opacity-50"
          >
            {busy.save && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

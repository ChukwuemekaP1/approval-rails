'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { CurrencyCode } from '@/domain/money/currency';
import { PurchaseFormFields } from './PurchaseFormFields';

interface Props {
  workspaceId: string;
}

export function NewPurchaseForm({ workspaceId }: Props) {
  const router = useRouter();
  const [intent, setIntent] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [category, setCategory] = useState('');
  const [preferredMerchant, setPreferredMerchant] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: intent.trim(),
          budget: budget.trim() ? budget.trim() : null,
          currency,
          category: category.trim() ? category.trim() : null,
          preferredMerchant: preferredMerchant.trim() ? preferredMerchant.trim() : null,
          autoResearch: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to create purchase request');
      }
      const data = await res.json();
      router.push(`/app/purchases/${data.request.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting purchase request');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
      {errorMsg && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          What do you need to purchase? <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          disabled={isSubmitting}
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="e.g. Ergonomic mesh office chair with adjustable lumbar support and armrests"
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
        />
        <p className="text-[11px] text-slate-400 mt-1">Be as specific as you like with desired specs, brands, or requirements.</p>
      </div>

      <PurchaseFormFields
        budget={budget}
        setBudget={setBudget}
        currency={currency}
        setCurrency={setCurrency}
        preferredMerchant={preferredMerchant}
        setPreferredMerchant={setPreferredMerchant}
        category={category}
        setCategory={setCategory}
        disabled={isSubmitting}
      />

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !intent.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-teal hover:bg-teal-600 text-white font-medium text-xs rounded-xl disabled:opacity-50 transition-colors shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Launching Discovery & Research...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submit & Research Candidates</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

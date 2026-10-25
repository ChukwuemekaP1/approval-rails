'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ShoppingBag,
  DollarSign,
  Building2,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/domain/money/currency';

export default function NewPurchaseRequestPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, activeWorkspace } = useAuth();

  const [intent, setIntent] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [category, setCategory] = useState('');
  const [preferredMerchant, setPreferredMerchant] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/purchases`, {
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

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
        <p className="text-sm text-slate-500">Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <Lock className="w-10 h-10 text-brand-teal mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Authentication Required</h2>
        <p className="text-xs text-slate-500 mt-1">Sign in with your passkey to create a purchase request.</p>
        <Link
          href="/auth"
          className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-brand-teal hover:bg-teal-600 text-white font-medium text-xs rounded-lg transition-colors"
        >
          Sign In with Passkey <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <Building2 className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">No Active Workspace</h2>
        <p className="text-xs text-slate-500 mt-1">Select or create a workspace before submitting purchase requests.</p>
        <Link
          href="/app/workspaces"
          className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-brand-teal hover:bg-teal-600 text-white font-medium text-xs rounded-lg transition-colors"
        >
          Go to Workspaces <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal">
            Phase 4: Discovery & Research
          </span>
          <span className="text-xs text-slate-400">Workspace: {activeWorkspace.name}</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
          New Purchase Request
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Describe the items or service you need. Our AI research assistant will query verified catalog sources and present comparisons.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
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
          <p className="text-[11px] text-slate-400 mt-1">
            Be as specific as you like with desired specs, brands, or requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Maximum Budget <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">
                {SUPPORTED_CURRENCIES[currency]?.symbol || '$'}
              </span>
              <input
                type="text"
                disabled={isSubmitting}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="250.00"
                className="w-full pl-7 pr-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Currency
            </label>
            <select
              disabled={isSubmitting}
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Merchant / Vendor <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              value={preferredMerchant}
              onChange={(e) => setPreferredMerchant(e.target.value)}
              placeholder="e.g. OfficePro, Amazon, Apple"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Office Furniture, IT Hardware"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
            />
          </div>
        </div>

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
    </div>
  );
}

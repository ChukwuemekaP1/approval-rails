'use client';

import React from 'react';
import { DollarSign, Shield, Calendar, Lock, ArrowRight, Copy, Check } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '@/domain/money/currency';
import { FormattedPolicyDTO } from './types';

interface Props {
  activePolicy: FormattedPolicyDTO;
  isAdmin: boolean;
  onEditClick: () => void;
  copiedHash: string | null;
  onCopyHash: (hash: string) => void;
}

export function PolicyOverviewTab({
  activePolicy,
  isAdmin,
  onEditClick,
  copiedHash,
  onCopyHash,
}: Props) {
  const symbol = SUPPORTED_CURRENCIES[activePolicy.currency]?.symbol || '$';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Currency</span>
            <DollarSign className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{activePolicy.currency}</div>
          <span className="text-xs text-slate-500">{SUPPORTED_CURRENCIES[activePolicy.currency]?.decimals} minor decimals</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Max Per Transaction</span>
            <Shield className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{symbol}{activePolicy.maxTransactionAmount}</div>
          <span className="text-xs text-slate-500">{activePolicy.maxTransactionAmountMinor} minor units</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Spend Cap</span>
            <Calendar className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{symbol}{activePolicy.monthlyBudgetCap}</div>
          <span className="text-xs text-slate-500">Cumulative budget per calendar month</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Threshold</span>
            <Lock className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{activePolicy.requireAdminAbove ? `${symbol}${activePolicy.requireAdminAbove}` : 'None'}</div>
          <span className="text-xs text-slate-500">{activePolicy.requireAdminAbove ? 'Requires workspace Admin' : 'Any member can execute'}</span>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{activePolicy.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Activated on {new Date(activePolicy.createdAt).toLocaleString()}</p>
          </div>
          {isAdmin ? (
            <button onClick={onEditClick} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal text-xs font-semibold rounded-lg transition-colors">
              Edit / Revise Policy <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic">Read-only view (MEMBER role)</span>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Canonical SHA-256 Content Hash</span>
            <button onClick={() => onCopyHash(activePolicy.contentHash)} className="flex items-center gap-1 text-xs text-brand-teal hover:underline">
              {copiedHash === activePolicy.contentHash ? (
                <><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-500">Copied!</span></>
              ) : (
                <><Copy className="w-3.5 h-3.5" /><span>Copy Hash</span></>
              )}
            </button>
          </div>
          <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all select-all">{activePolicy.contentHash}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category Allowlist</span>
            <div className="mt-1.5">
              {activePolicy.allowedCategories && activePolicy.allowedCategories.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {activePolicy.allowedCategories.map((c) => (
                    <span key={c} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs">{c}</span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400">All categories permitted</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Merchant Denylist</span>
            <div className="mt-1.5">
              {activePolicy.blockedMerchants && activePolicy.blockedMerchants.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {activePolicy.blockedMerchants.map((m) => (
                    <span key={m} className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded text-xs">{m}</span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400">No merchants blocked</span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Deterministic Canonical Representation</span>
          <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
            {JSON.stringify(JSON.parse(activePolicy.canonicalContent), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

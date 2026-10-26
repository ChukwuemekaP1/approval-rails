'use client';

import React from 'react';
import { CurrencyCode } from '@/domain/money/currency';
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, Mail } from 'lucide-react';

interface Props {
  workspaceType: 'PERSONAL' | 'BUSINESS';
  name: string;
  setName: (v: string) => void;
  currency: CurrencyCode;
  setCurrency: (v: CurrencyCode) => void;
  maxTx: string;
  setMaxTx: (v: string) => void;
  monthlyCap: string;
  setMonthlyCap: (v: string) => void;
  managerEmail: string;
  setManagerEmail: (v: string) => void;
  requireAdminAbove: string;
  setRequireAdminAbove: (v: string) => void;
  isLoading: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function OnboardingStepLimits(props: Props) {
  const isBiz = props.workspaceType === 'BUSINESS';

  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <div className="text-center pb-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {isBiz ? 'Configure Business Policy' : 'Set Spending Limits'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Limits enforced authoritatively on the server in minor units.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Name</label>
          <input
            type="text"
            required
            value={props.name}
            onChange={(e) => props.setName(e.target.value)}
            placeholder={isBiz ? 'Acme Corp' : 'Personal Workspace'}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Currency</label>
          <select
            value={props.currency}
            onChange={(e) => props.setCurrency(e.target.value as CurrencyCode)}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Transaction Limit</label>
          <input
            type="number"
            min="1"
            required
            value={props.maxTx}
            onChange={(e) => props.setMaxTx(e.target.value)}
            placeholder={isBiz ? '10000.00' : '1000.00'}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Monthly Cap</label>
          <input
            type="number"
            min="1"
            required
            value={props.monthlyCap}
            onChange={(e) => props.setMonthlyCap(e.target.value)}
            placeholder={isBiz ? '50000.00' : '5000.00'}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      {isBiz && (
        <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Manager Approval Gate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="font-medium text-slate-700 dark:text-slate-300">Manager Email (Optional)</label>
              <input
                type="email"
                value={props.managerEmail}
                onChange={(e) => props.setManagerEmail(e.target.value)}
                placeholder="manager@company.com"
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 dark:text-slate-300">Approval Above ($)</label>
              <input
                type="number"
                min="0"
                value={props.requireAdminAbove}
                onChange={(e) => props.setRequireAdminAbove(e.target.value)}
                placeholder="1000.00"
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={props.onBack}
          className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <button
          type="submit"
          disabled={props.isLoading || !props.name.trim()}
          className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs disabled:opacity-50"
        >
          {props.isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete & Enter</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

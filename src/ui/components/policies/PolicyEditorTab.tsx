'use client';

import React from 'react';
import { Lock, FileCheck2, Loader2 } from 'lucide-react';
import { CurrencyCode } from '@/domain/money/currency';
import { FormattedPolicyDTO } from './types';
import { PolicyFormFields } from './PolicyFormFields';

interface Props {
  isAdmin: boolean;
  isSaving: boolean;
  isDirty: boolean;
  activePolicy: FormattedPolicyDTO | null;
  formName: string;
  setFormName: (v: string) => void;
  formCurrency: CurrencyCode;
  setFormCurrency: (c: CurrencyCode) => void;
  formMaxTx: string;
  setFormMaxTx: (v: string) => void;
  formMonthlyCap: string;
  setFormMonthlyCap: (v: string) => void;
  formRequireAdminAbove: string;
  setFormRequireAdminAbove: (v: string) => void;
  formAllowedCategories: string;
  setFormAllowedCategories: (v: string) => void;
  formBlockedMerchants: string;
  setFormBlockedMerchants: (v: string) => void;
  validationErrors: string[];
  onReset: () => void;
  onSave: (e: React.FormEvent) => void;
}

export function PolicyEditorTab({
  isAdmin, isSaving, isDirty, activePolicy,
  formName, setFormName, formCurrency, setFormCurrency,
  formMaxTx, setFormMaxTx, formMonthlyCap, setFormMonthlyCap,
  formRequireAdminAbove, setFormRequireAdminAbove,
  formAllowedCategories, setFormAllowedCategories,
  formBlockedMerchants, setFormBlockedMerchants,
  validationErrors, onReset, onSave,
}: Props) {
  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-3 text-amber-800 dark:text-amber-400 text-sm">
          <Lock className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Administrator Authorization Required: </span>
            Only users with the <span className="font-mono font-bold">ADMIN</span> role can publish and activate new policy versions.
          </div>
        </div>
      )}

      <form onSubmit={onSave} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Publish New Policy Version</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Modifications create Version {(activePolicy?.version || 0) + 1} and archive Version {activePolicy?.version}.
            </p>
          </div>
          {isDirty ? (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full text-xs font-medium text-amber-700 dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />Unsaved Changes (Draft)
            </div>
          ) : (
            <div className="text-xs text-slate-400">Matches current active policy</div>
          )}
        </div>

        {validationErrors.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl space-y-1 text-xs text-red-700 dark:text-red-400">
            <span className="font-semibold block mb-1">Please correct the following:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              {validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          </div>
        )}

        <PolicyFormFields
          disabled={!isAdmin || isSaving}
          formName={formName} setFormName={setFormName}
          formCurrency={formCurrency} setFormCurrency={setFormCurrency}
          formMaxTx={formMaxTx} setFormMaxTx={setFormMaxTx}
          formMonthlyCap={formMonthlyCap} setFormMonthlyCap={setFormMonthlyCap}
          formRequireAdminAbove={formRequireAdminAbove} setFormRequireAdminAbove={setFormRequireAdminAbove}
          formAllowedCategories={formAllowedCategories} setFormAllowedCategories={setFormAllowedCategories}
          formBlockedMerchants={formBlockedMerchants} setFormBlockedMerchants={setFormBlockedMerchants}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onReset}
            disabled={!isDirty || isSaving}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors"
          >
            Discard Draft Changes
          </button>
          <button
            type="submit"
            disabled={!isAdmin || isSaving || validationErrors.length > 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-teal hover:bg-teal-600 text-white font-medium text-sm rounded-xl disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Publishing Canonical Version...</span></>
            ) : (
              <><FileCheck2 className="w-4 h-4" /><span>Publish & Activate Version {(activePolicy?.version || 0) + 1}</span></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

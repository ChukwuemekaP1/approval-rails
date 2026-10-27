'use client';

import React from 'react';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/domain/money/currency';

interface Props {
  disabled: boolean;
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
}

export function PolicyFormFields({
  disabled,
  formName, setFormName,
  formCurrency, setFormCurrency,
  formMaxTx, setFormMaxTx,
  formMonthlyCap, setFormMonthlyCap,
  formRequireAdminAbove, setFormRequireAdminAbove,
  formAllowedCategories, setFormAllowedCategories,
  formBlockedMerchants, setFormBlockedMerchants,
}: Props) {
  const sym = SUPPORTED_CURRENCIES[formCurrency]?.symbol || '$';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Policy Name</label>
        <input
          type="text"
          disabled={disabled}
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="e.g. Q4 Standard Spending Policy"
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Workspace Currency</label>
        <select
          disabled={disabled}
          value={formCurrency}
          onChange={(e) => setFormCurrency(e.target.value as CurrencyCode)}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
        >
          {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
            <option key={curr.code} value={curr.code}>{curr.code} ({curr.symbol})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Per-Transaction Cap ({sym})</label>
        <input
          type="text"
          disabled={disabled}
          value={formMaxTx}
          onChange={(e) => setFormMaxTx(e.target.value)}
          placeholder="250.00"
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Budget Cap ({sym})</label>
        <input
          type="text"
          disabled={disabled}
          value={formMonthlyCap}
          onChange={(e) => setFormMonthlyCap(e.target.value)}
          placeholder="1000.00"
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Require Admin Above ({sym})</label>
        <input
          type="text"
          disabled={disabled}
          value={formRequireAdminAbove}
          onChange={(e) => setFormRequireAdminAbove(e.target.value)}
          placeholder="Leave blank for no escalation"
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Allowed Categories (Optional)</label>
        <input
          type="text"
          disabled={disabled}
          value={formAllowedCategories}
          onChange={(e) => setFormAllowedCategories(e.target.value)}
          placeholder="Office Supplies, Software, Electronics"
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Blocked Merchants (Optional)</label>
        <input
          type="text"
          disabled={disabled}
          value={formBlockedMerchants}
          onChange={(e) => setFormBlockedMerchants(e.target.value)}
          placeholder="Untrusted Vendor, Shady Corp"
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
        />
      </div>
    </div>
  );
}

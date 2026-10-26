'use client';

import React from 'react';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/domain/money/currency';

interface Props {
  budget: string;
  setBudget: (v: string) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  preferredMerchant: string;
  setPreferredMerchant: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  disabled: boolean;
}

export function PurchaseFormFields({
  budget, setBudget,
  currency, setCurrency,
  preferredMerchant, setPreferredMerchant,
  category, setCategory,
  disabled
}: Props) {
  return (
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
            disabled={disabled}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="250.00"
            className="w-full pl-7 pr-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
        <select
          disabled={disabled}
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
        >
          {Object.values(SUPPORTED_CURRENCIES).map((c) => (
            <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Preferred Merchant / Vendor <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          disabled={disabled}
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
          disabled={disabled}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Office Furniture, IT Hardware"
          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
        />
      </div>
    </div>
  );
}

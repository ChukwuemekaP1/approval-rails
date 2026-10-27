'use client';

import React from 'react';
import { DollarSign, Shield, Calendar, Lock } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '@/domain/money/currency';
import { FormattedPolicyDTO } from './types';

interface Props {
  policy: FormattedPolicyDTO;
}

export function PolicyMetricCards({ policy }: Props) {
  const symbol = SUPPORTED_CURRENCIES[policy.currency]?.symbol || '$';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Currency</span>
          <DollarSign className="w-4 h-4 text-brand-teal" />
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{policy.currency}</div>
        <span className="text-xs text-slate-500">{SUPPORTED_CURRENCIES[policy.currency]?.decimals} minor decimals</span>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Max Per Transaction</span>
          <Shield className="w-4 h-4 text-brand-teal" />
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{symbol}{policy.maxTransactionAmount}</div>
        <span className="text-xs text-slate-500">{policy.maxTransactionAmountMinor} minor units</span>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Spend Cap</span>
          <Calendar className="w-4 h-4 text-brand-teal" />
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{symbol}{policy.monthlyBudgetCap}</div>
        <span className="text-xs text-slate-500">Cumulative budget per calendar month</span>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Threshold</span>
          <Lock className="w-4 h-4 text-brand-teal" />
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{policy.requireAdminAbove ? `${symbol}${policy.requireAdminAbove}` : 'None'}</div>
        <span className="text-xs text-slate-500">{policy.requireAdminAbove ? 'Requires workspace Admin' : 'Any member can execute'}</span>
      </div>
    </div>
  );
}

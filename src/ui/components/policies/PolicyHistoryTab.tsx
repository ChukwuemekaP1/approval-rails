'use client';

import React from 'react';
import { SUPPORTED_CURRENCIES } from '@/domain/money/currency';
import { FormattedPolicyDTO } from './types';

interface Props {
  versions: FormattedPolicyDTO[];
  onInspect: (v: FormattedPolicyDTO) => void;
}

export function PolicyHistoryTab({ versions, onInspect }: Props) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Immutable Policy Version Trail</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Every policy update is persisted as an append-only version with a computed SHA-256 hash. Historical records are never deleted or mutated.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Caps (Tx / Month)</th>
                <th className="py-3 px-4">SHA-256 Hash</th>
                <th className="py-3 px-4">Activated At</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {versions.map((v) => {
                const vSymbol = SUPPORTED_CURRENCIES[v.currency]?.symbol || '$';
                return (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">v{v.version}</td>
                    <td className="py-3.5 px-4">
                      {v.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{v.name}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">{vSymbol}{v.maxTransactionAmount} / {vSymbol}{v.monthlyBudgetCap}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{v.contentHash.slice(0, 12)}...</td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(v.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={() => onInspect(v)} className="text-brand-teal hover:underline font-semibold">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

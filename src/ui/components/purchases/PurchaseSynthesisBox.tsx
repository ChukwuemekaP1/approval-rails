'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { PurchaseRequestDTO } from '@/application/purchase/purchase-use-cases';

interface Props {
  summary: NonNullable<PurchaseRequestDTO['summary']>;
}

export function PurchaseSynthesisBox({ summary }: Props) {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-brand-teal">
        <Sparkles className="w-4 h-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          AI Research Synthesis
        </h2>
      </div>
      <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        {summary.summaryMarkdown}
      </div>
      {summary.recommendationReason && (
        <div className="p-3 bg-brand-teal/5 border border-brand-teal/20 rounded-xl text-xs text-slate-700 dark:text-slate-200">
          <span className="font-semibold text-brand-teal">Top Recommendation: </span>
          {summary.recommendationReason}
        </div>
      )}
    </div>
  );
}

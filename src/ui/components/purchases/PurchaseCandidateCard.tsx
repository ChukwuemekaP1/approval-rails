'use client';

import React from 'react';
import { ExternalLink, Check, ShieldCheck, Loader2 } from 'lucide-react';
import { PurchaseRequestDTO } from '@/application/purchase/purchase-use-cases';
import { SUPPORTED_CURRENCIES } from '@/domain/money/currency';

interface Props {
  candidate: PurchaseRequestDTO['candidates'][number];
  isRecommended: boolean;
  comparison?: PurchaseRequestDTO['summary'] extends { comparisons: (infer C)[] } ? C : any;
  onCreateProposal: (id: string) => void;
  isCreating: boolean;
}

export function PurchaseCandidateCard({
  candidate: c,
  isRecommended,
  comparison,
  onCreateProposal,
  isCreating,
}: Props) {
  const sym = SUPPORTED_CURRENCIES[c.currency || 'USD']?.symbol || '$';

  return (
    <div
      className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm flex flex-col justify-between transition-all ${
        isRecommended ? 'border-brand-teal ring-1 ring-brand-teal/40' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {c.merchant}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 uppercase">
              {c.providerId}
            </span>
            {isRecommended && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal text-white">
                Recommended
              </span>
            )}
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
            c.availabilityStatus === 'IN_STOCK'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            {c.availabilityStatus}
          </span>
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{c.title}</h3>
        {c.description && <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>}

        {comparison && (
          <div className="pt-2 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
            {comparison.strengths?.length > 0 && (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Check className="w-3 h-3 shrink-0" />
                <span>{comparison.strengths[0]}</span>
              </div>
            )}
            {comparison.bestFor && <div className="text-slate-400 italic">Best for: {comparison.bestFor}</div>}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          {c.price ? (
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {sym}{c.price} <span className="text-[10px] text-slate-400 font-normal">{c.currency}</span>
            </span>
          ) : (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Price Unconfirmed</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={c.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
          >
            <span>Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {c.price && (
            <button
              onClick={() => onCreateProposal(c.id)}
              disabled={isCreating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Create Proposal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

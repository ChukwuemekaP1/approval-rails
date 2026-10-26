'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { PurchaseRequestDTO } from '@/application/purchase/purchase-use-cases';
import { SUPPORTED_CURRENCIES } from '@/domain/money/currency';

interface Props {
  request: PurchaseRequestDTO;
  workspaceName?: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export function PurchaseRequestHeader({ request, workspaceName, isRetrying, onRetry }: Props) {
  const symbol = SUPPORTED_CURRENCIES[request.currency]?.symbol || '$';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-teal/10 text-brand-teal">
              Discovery & Research
            </span>
            <span className="text-[11px] text-slate-400">ID: {request.id.slice(0, 8)}...</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {request.intent}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Created {new Date(request.createdAt).toLocaleString()} in workspace {workspaceName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {request.status === 'COMPLETED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Research Completed
            </span>
          )}
          {request.status === 'RESEARCHING' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
              Research In Progress
            </span>
          )}
          {request.status === 'FAILED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              Research Failed
            </span>
          )}
          {request.status === 'DRAFT' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5" />
              Draft Request
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Target Budget</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {request.budget ? `${symbol}${request.budget}` : 'No explicit cap'}
          </p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Currency</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{request.currency}</p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Category</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{request.category || 'General'}</p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Preferred Vendor</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{request.preferredMerchant || 'Any verified'}</p>
        </div>
      </div>

      {(request.status === 'DRAFT' || request.status === 'FAILED') && (
        <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {request.status === 'FAILED' ? 'Catalog Research Failed' : 'Ready for Catalog Research'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {request.failureReason || 'Query catalog providers and synthesize options with AI.'}
            </p>
          </div>
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-teal hover:bg-teal-600 text-white font-medium text-xs rounded-xl disabled:opacity-50 transition-colors shadow-sm"
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running Research...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{request.status === 'FAILED' ? 'Retry Research' : 'Start Research'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

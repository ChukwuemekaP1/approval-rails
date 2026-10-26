'use client';

import React from 'react';
import { AlertCircle, RefreshCw, ShoppingBag, Loader2 } from 'lucide-react';

interface Props {
  error: string | null;
  isLoading: boolean;
  productsCount: number;
  hasSearched: boolean;
  onRetry: () => void;
}

export function ShopStatusBanner({ error, isLoading, productsCount, hasSearched, onRetry }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
        <span className="text-xs">Searching live provider catalog...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-xs font-semibold">Catalog Provider Notice</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">{error}</p>
          </div>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (hasSearched && productsCount === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No verified products found</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          We found zero products matching this query from the live catalog. Try adjusting your brand or keywords.
        </p>
      </div>
    );
  }

  return null;
}

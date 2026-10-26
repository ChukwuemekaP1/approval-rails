'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';

interface Props {
  query: string;
  setQuery: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleRefine: () => void;
  isRefining: boolean;
  basketCount: number;
  isLiveChannel3: boolean;
}

export function ShopHeader({
  query,
  setQuery,
  onSubmit,
  onToggleRefine,
  isRefining,
  basketCount,
  isLiveChannel3,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Product Discovery</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLiveChannel3 ? 'Channel3 Live Enterprise Catalog' : 'Verified Commercial Procurement Catalog'}
          </p>
        </div>

        <Link
          href="/app/cart"
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Procurement Basket</span>
          {basketCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-white text-teal-800 text-[10px] font-bold">
              {basketCount}
            </span>
          )}
        </Link>
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any product (e.g. phone, iPhone 16, laptop, shoes, chair)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <button
          type="button"
          onClick={onToggleRefine}
          disabled={!query.trim()}
          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            isRefining
              ? 'bg-teal-50 border-teal-300 text-teal-700 dark:bg-teal-950 dark:border-teal-700 dark:text-teal-300'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40'
          }`}
          title="Refine search requirements"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Refine</span>
        </button>

        <button
          type="submit"
          className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
}

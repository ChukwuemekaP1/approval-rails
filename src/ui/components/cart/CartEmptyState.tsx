'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export function CartEmptyState() {
  return (
    <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Your basket is currently empty</h3>
      <p className="text-xs text-slate-500 mt-1 mb-5">
        Search products and add multiple offers across different categories without losing them.
      </p>
      <Link
        href="/app/shop"
        className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
      >
        Start Product Discovery
      </Link>
    </div>
  );
}

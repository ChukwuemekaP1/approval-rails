'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PurchaseRequestDTO } from '@/application/purchase/purchase-use-cases';

interface PurchaseListItemProps {
  request: PurchaseRequestDTO;
}

export function PurchaseListItem({ request: r }: PurchaseListItemProps) {
  return (
    <Link
      href={`/app/purchases/${r.id}`}
      className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-sky-500 rounded-xl shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{r.intent}</h3>
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span>{r.currency} {r.budget ? `Max: ${r.budget}` : ''}</span>
          <span>• {r.candidates.length} candidate(s)</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          {r.status}
        </span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </Link>
  );
}

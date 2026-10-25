'use client';

import React from 'react';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

interface Props {
  selectedCount: number;
  totalCount: number;
  selectedSubtotal: string;
  totalBasket: string;
  onProcureSelected: () => void;
  onProcureAll: () => void;
  isProcuring: boolean;
}

export function CartSummary(props: Props) {
  const {
    selectedCount,
    totalCount,
    selectedSubtotal,
    totalBasket,
    onProcureSelected,
    onProcureAll,
    isProcuring,
  } = props;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Procurement Summary</h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-slate-500">
          <span>Total Items in Basket</span>
          <span className="font-medium text-slate-900 dark:text-white">{totalCount} items</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Basket Total</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{totalBasket}</span>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">Selected Subtotal</span>
            <span className="text-[10px] text-teal-600 font-medium">({selectedCount} items selected)</span>
          </div>
          <span className="text-base font-extrabold text-teal-600 dark:text-teal-400">
            {selectedSubtotal}
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <button
          onClick={onProcureSelected}
          disabled={selectedCount === 0 || isProcuring}
          className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 transition-colors"
        >
          {isProcuring ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Procure Selected ({selectedCount}) <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {selectedCount < totalCount && (
          <button
            onClick={onProcureAll}
            disabled={isProcuring}
            className="w-full py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-colors"
          >
            Procure All Items ({totalCount})
          </button>
        )}
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-start gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <span>
          Selected lines will be sealed into an immutable proposal. Any unselected items remain safely in your basket.
        </span>
      </div>
    </div>
  );
}

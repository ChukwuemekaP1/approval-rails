'use client';

import React from 'react';
import { Plus, Minus, Trash2, Store } from 'lucide-react';

interface Props {
  item: {
    id: string;
    title: string;
    merchant: string;
    imageUrl: string | null;
    unitPriceMinor: string;
    lineTotalMinor: string;
    formattedUnitPrice: string;
    formattedLineTotal: string;
    currency: string;
    quantity: number;
    selected: boolean;
  };
  onToggleSelect: (id: string, selected: boolean) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export function CartLineItem({ item, onToggleSelect, onUpdateQuantity, onRemove }: Props) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={(e) => onToggleSelect(item.id, e.target.checked)}
          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700"
        />

        <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-slate-400">Item</span>
          )}
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
            <Store className="w-3 h-3 text-slate-400" />
            <span>{item.merchant}</span>
            <span>•</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{item.formattedUnitPrice} each</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-30"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-xs font-semibold px-1">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 rounded text-slate-500 hover:text-slate-700"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="text-right min-w-[70px]">
          <span className="text-xs font-bold text-slate-900 dark:text-white block">
            {item.formattedLineTotal}
          </span>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

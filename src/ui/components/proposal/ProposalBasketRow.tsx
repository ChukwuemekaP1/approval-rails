'use client';

import React from 'react';
import { ProposalLineItemDTO } from '@/application/proposal/proposal-dto';
import { ExternalLink, Plus, Minus, Trash2 } from 'lucide-react';

interface Props {
  item: ProposalLineItemDTO;
  currencySymbol: string;
  isModifiable: boolean;
  currentQty: number;
  onQtyChange: (candidateId: string, delta: number) => void;
  onRemove: (candidateId: string) => void;
  canRemove: boolean;
  isUpdating: boolean;
}

export const ProposalBasketRow: React.FC<Props> = ({
  item,
  currencySymbol,
  isModifiable,
  currentQty,
  onQtyChange,
  onRemove,
  canRemove,
  isUpdating,
}) => {
  return (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {item.title}
          </h4>
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-brand-teal shrink-0"
            title="View Source Product"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Merchant: {item.merchant} &bull; Unit: {currencySymbol}{item.unitPrice} {item.currency}
        </p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
        {isModifiable ? (
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => onQtyChange(item.candidateId, -1)}
              disabled={currentQty <= 1 || isUpdating}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-mono font-bold">
              {currentQty}
            </span>
            <button
              type="button"
              onClick={() => onQtyChange(item.candidateId, 1)}
              disabled={isUpdating}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">
            Qty: {item.quantity}
          </span>
        )}

        <div className="text-right min-w-[70px]">
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
            {currencySymbol}{item.totalPrice}
          </span>
        </div>

        {isModifiable && canRemove && (
          <button
            onClick={() => onRemove(item.candidateId)}
            disabled={isUpdating}
            className="text-slate-400 hover:text-rose-500 p-1"
            title="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

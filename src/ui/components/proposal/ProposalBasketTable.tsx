'use client';

import React, { useState } from 'react';
import { ProposalLineItemDTO } from '@/application/proposal/proposal-dto';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/domain/money/currency';
import { RefreshCw } from 'lucide-react';
import { ProposalBasketRow } from './ProposalBasketRow';

interface Props {
  items: ProposalLineItemDTO[];
  currency: CurrencyCode;
  totalAmount: string;
  isModifiable: boolean;
  onUpdateBasket: (items: Array<{ candidateId: string; quantity: number }>) => Promise<void>;
  isUpdating: boolean;
}

export const ProposalBasketTable: React.FC<Props> = ({
  items,
  currency,
  totalAmount,
  isModifiable,
  onUpdateBasket,
  isUpdating,
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(items.map((i) => [i.candidateId, i.quantity]))
  );

  const currencySymbol = SUPPORTED_CURRENCIES[currency]?.symbol || '$';

  const handleQtyChange = (candidateId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[candidateId] || 1;
      return { ...prev, [candidateId]: Math.max(1, current + delta) };
    });
  };

  const handleRemove = (candidateId: string) => {
    if (items.length <= 1) return;
    const remaining = items
      .filter((i) => i.candidateId !== candidateId)
      .map((i) => ({ candidateId: i.candidateId, quantity: quantities[i.candidateId] || i.quantity }));
    onUpdateBasket(remaining);
  };

  const hasModifications = items.some(
    (i) => quantities[i.candidateId] !== undefined && quantities[i.candidateId] !== i.quantity
  );

  const handleApplyChanges = () => {
    const payload = items.map((i) => ({
      candidateId: i.candidateId,
      quantity: quantities[i.candidateId] || i.quantity,
    }));
    onUpdateBasket(payload);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Unsigned Purchase Basket ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h3>
        {isModifiable && hasModifications && (
          <button
            onClick={handleApplyChanges}
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-teal hover:bg-teal-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
            Recalculate Terms
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item) => (
          <ProposalBasketRow
            key={item.id}
            item={item}
            currencySymbol={currencySymbol}
            isModifiable={isModifiable}
            currentQty={quantities[item.candidateId] ?? item.quantity}
            onQtyChange={handleQtyChange}
            onRemove={handleRemove}
            canRemove={items.length > 1}
            isUpdating={isUpdating}
          />
        ))}
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Authoritative Mandate Total
        </span>
        <span className="text-lg font-black text-slate-900 dark:text-white">
          {currencySymbol}{totalAmount} <span className="text-xs text-slate-400 font-normal">{currency}</span>
        </span>
      </div>
    </div>
  );
};

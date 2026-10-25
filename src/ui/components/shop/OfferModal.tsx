'use client';

import React from 'react';
import { X, ExternalLink, Store, ShoppingBag, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DiscoveredProduct, DiscoveredOffer } from '@/domain/catalog/discovery-types';

interface Props {
  product: DiscoveredProduct | null;
  onClose: () => void;
  onSelectOffer: (product: DiscoveredProduct, offer: DiscoveredOffer) => void;
  isAdding?: boolean;
}

export function OfferModal({ product, onClose, onSelectOffer, isAdding }: Props) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="pr-4">
            <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">
              {product.brand || product.category || 'Product Offers'}
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5">
              {product.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <p className="text-xs text-slate-500">
            Compare prices and terms across {product.offers.length} verified merchant offers:
          </p>

          <div className="space-y-2.5">
            {product.offers.map((offer) => (
              <div
                key={offer.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between transition-all"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {offer.merchant}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{offer.condition || 'New'}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">In Stock</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {offer.formattedPrice}
                  </span>
                  <button
                    onClick={() => onSelectOffer(product, offer)}
                    disabled={isAdding}
                    className="mt-1.5 py-1 px-3 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-medium rounded-lg flex items-center gap-1 disabled:opacity-50"
                  >
                    <ShoppingBag className="w-3 h-3" /> Add Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center text-[11px] text-slate-500">
          Selected offer terms are cryptographically sealed upon procurement.
        </div>
      </div>
    </div>
  );
}

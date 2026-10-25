'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Eye, Store, Check, AlertCircle } from 'lucide-react';
import { DiscoveredProduct } from '@/domain/catalog/discovery-types';

interface Props {
  product: DiscoveredProduct;
  onViewOffers: (product: DiscoveredProduct) => void;
  onQuickAdd: (product: DiscoveredProduct) => void;
  isAdding?: boolean;
}

export function ProductCard({ product, onViewOffers, onQuickAdd, isAdding }: Props) {
  const [imgError, setImgError] = useState(false);
  const primaryOffer = product.offers[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-teal-500/50 transition-all shadow-sm hover:shadow-md">
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden group">
        {product.primaryImage && !imgError ? (
          <img
            src={product.primaryImage}
            alt={product.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <ShoppingBag className="w-8 h-8 mb-1 opacity-50" />
            <span className="text-[10px] font-medium">{product.category || 'Product'}</span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-sm backdrop-blur-sm">
            {product.brand || product.category || 'Verified'}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {product.title}
          </h3>
          <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {product.description || 'Enterprise catalog verified hardware specification.'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
              {primaryOffer ? primaryOffer.formattedPrice : '$0.00'}
            </span>
            <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
              <Store className="w-3 h-3 text-slate-400" />
              {product.offers.length} {product.offers.length === 1 ? 'offer' : 'offers'}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewOffers(product)}
              className="py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1"
            >
              <Eye className="w-3 h-3" /> Compare
            </button>
            <button
              onClick={() => onQuickAdd(product)}
              disabled={isAdding}
              className="py-1.5 px-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-medium flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <ShoppingBag className="w-3 h-3" /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

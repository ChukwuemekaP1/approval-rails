'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, Sparkles, X, ArrowRight } from 'lucide-react';

export interface RefinementValues {
  brand: string;
  minPrice: string;
  maxPrice: string;
  condition: string;
  specifications: string;
}

interface Props {
  initialQuery: string;
  onSearch: (query: string, filters: RefinementValues) => void;
  onSkip: () => void;
  onCancel: () => void;
}

export function ProductRefinementCard({ initialQuery, onSearch, onSkip, onCancel }: Props) {
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('ANY');
  const [specs, setSpecs] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = [initialQuery, brand.trim(), specs.trim()].filter(Boolean);
    onSearch(parts.join(' '), { brand, minPrice, maxPrice, condition, specifications: specs });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-teal-500/30 rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-600" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Refine &quot;{initialQuery}&quot; (Optional)
          </h3>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleApply} className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Apple, Dell"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
            >
              <option value="ANY">Any</option>
              <option value="NEW">Brand New</option>
              <option value="REFURBISHED">Refurbished</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Min $</label>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Max $</label>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="1000"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Specs / Requirements
          </label>
          <input
            type="text"
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            placeholder="e.g. 256GB storage, noise-cancelling"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button type="button" onClick={onSkip} className="text-xs text-slate-500 hover:text-slate-700 underline">
            Skip refinement
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply & Search</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React from 'react';
import { Laptop, Armchair, Network, Printer, Monitor, PackageCheck } from 'lucide-react';

export const CATEGORIES = [
  { name: 'Laptops', icon: Laptop },
  { name: 'Office Furniture', icon: Armchair },
  { name: 'Networking', icon: Network },
  { name: 'Printer Supplies', icon: Printer },
  { name: 'Electronics', icon: Monitor },
  { name: 'Office Supplies', icon: PackageCheck },
];

interface Props {
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryChips({ selectedCategory, onSelect }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
          selectedCategory === null
            ? 'bg-teal-600 text-white shadow-sm'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
        }`}
      >
        All Categories
      </button>

      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() => onSelect(isSelected ? null : cat.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              isSelected
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}

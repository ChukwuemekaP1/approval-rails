'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  viewMode: 'grid' | 'table' | 'timeline';
  onViewModeChange: (mode: 'grid' | 'table' | 'timeline') => void;
}

export function LedgerHeader({ viewMode, onViewModeChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
      <div>
        <span className="text-[11px] font-bold text-sky-600 uppercase">Cryptographic Audit Trail</span>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Operational Ledger & Analysis</h1>
        <p className="text-xs text-gray-500">Tamper-evident hash-chained sequence of workspace events across spheres.</p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/app/verify"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold bg-white dark:bg-gray-900 hover:bg-gray-50"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Offline Verifier
        </Link>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm font-semibold text-sky-700 dark:text-sky-300' : 'text-gray-500'
            }`}
          >
            Audit Grid
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm font-semibold' : 'text-gray-500'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => onViewModeChange('timeline')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'timeline' ? 'bg-white dark:bg-gray-700 shadow-sm font-semibold' : 'text-gray-500'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>
    </div>
  );
}

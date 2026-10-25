'use client';

import React from 'react';
import { LedgerEntry } from '@/domain/ledger/types';
import { formatMinorUnitsToDecimal } from '@/domain/money/currency';
import { ShieldCheck, Hash, User, Clock, ArrowUpRight } from 'lucide-react';

interface Props {
  entries: LedgerEntry[];
  isLoading?: boolean;
}

export function MobileAuditStream({ entries, isLoading }: Props) {
  if (isLoading) {
    return <div className="p-8 text-center text-xs text-gray-500">Loading audit records...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-900 border rounded-xl text-xs text-gray-500">
        No ledger events match the selected criteria.
      </div>
    );
  }

  return (
    <div className="space-y-2.5 md:hidden">
      {entries.map((entry) => {
        const ev = entry.eventType;
        const color = ev.includes('COMPLETED') || ev.includes('SEALED') || ev.includes('APPROVED')
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : ev.includes('FAILED') || ev.includes('DENIED') || ev.includes('REJECTED')
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-amber-50 text-amber-700 border-amber-200';

        const rawMinor = entry.payload?.amountMinor;
        const cur = (typeof entry.payload?.currency === 'string' ? entry.payload.currency : 'USD') as any;
        const amountStr = (typeof rawMinor === 'string' || typeof rawMinor === 'number' || typeof rawMinor === 'bigint')
          ? `$${formatMinorUnitsToDecimal(BigInt(rawMinor), cur)}`
          : null;

        return (
          <div
            key={entry.id}
            className="p-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl space-y-2 text-xs shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                #{entry.sequence}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color}`}>
                {ev}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1 truncate">
                <User className="w-3 h-3 shrink-0 text-gray-400" />
                <span className="truncate">{entry.actor?.kind || 'SYSTEM'}: {entry.actor?.id || '-'}</span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 shrink-0 text-gray-400" />
                <span>{entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '-'}</span>
              </div>
            </div>

            {amountStr && (
              <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg text-emerald-700 font-bold">
                <span>Settlement Amount</span>
                <span>{amountStr}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                Hash: {entry.hash ? `${entry.hash.slice(0, 12)}...` : '-'}
              </span>
              <span>Prev: {entry.prevHash ? `${entry.prevHash.slice(0, 8)}...` : '-'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

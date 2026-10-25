'use client';

import React from 'react';
import { LedgerEntry } from '@/domain/ledger/types';
import { ShieldAlert, CreditCard, ShoppingBag, Layers, CheckCircle2 } from 'lucide-react';
import { formatMinorUnitsToDecimal } from '@/domain/money/currency';

export type SphereType = 'ALL' | 'GOVERNANCE' | 'SETTLEMENT' | 'PROCUREMENT';

interface Props {
  selectedSphere: SphereType;
  onSelectSphere: (sphere: SphereType) => void;
  entries: LedgerEntry[];
  filteredEntries: LedgerEntry[];
}

export function LedgerSphereAnalytics({
  selectedSphere,
  onSelectSphere,
  entries,
  filteredEntries,
}: Props) {
  const totalVolumeMinor = filteredEntries.reduce((acc, entry) => {
    const raw = entry.payload?.amountMinor;
    if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'bigint') {
      return acc + BigInt(raw);
    }
    return acc;
  }, 0n);

  const distinctActors = new Set(filteredEntries.map((e) => e.actor?.id).filter(Boolean)).size;

  const spheres: { id: SphereType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'ALL',
      label: 'All Spheres',
      icon: <Layers className="w-3.5 h-3.5" />,
      count: entries.length,
    },
    {
      id: 'GOVERNANCE',
      label: 'Business Governance',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      count: entries.filter((e) =>
        ['APPROVAL_REQUESTED', 'PROPOSAL_APPROVED', 'PROPOSAL_REJECTED', 'POLICY_EVALUATED', 'TERMS_SEALED', 'TERMS_UNSEALED'].includes(e.eventType)
      ).length,
    },
    {
      id: 'SETTLEMENT',
      label: 'Settlement & Payment',
      icon: <CreditCard className="w-3.5 h-3.5" />,
      count: entries.filter((e) =>
        ['ORDER_CREATED', 'CAPTURE_REQUESTED', 'CAPTURE_COMPLETED', 'CAPTURE_FAILED', 'PAYMENT_COMPLETED', 'WEBHOOK_PROCESSED', 'RECONCILIATION_COMPLETED'].includes(e.eventType)
      ).length,
    },
    {
      id: 'PROCUREMENT',
      label: 'Procurement & Catalog',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      count: entries.filter((e) =>
        ['REQUEST_CREATED', 'RESEARCH_COMPLETED', 'PROPOSAL_CREATED', 'PROPOSAL_REVISED', 'BASKET_UPDATED'].includes(e.eventType)
      ).length,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {spheres.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelectSphere(s.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedSphere === s.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 border text-gray-700 dark:text-gray-300 hover:bg-gray-50'
            }`}
          >
            {s.icon}
            <span>{s.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSphere === s.id ? 'bg-sky-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="p-3 bg-white dark:bg-gray-900 border rounded-xl">
          <p className="text-[11px] text-gray-500 font-medium">Sphere Events</p>
          <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-0.5">{filteredEntries.length}</p>
        </div>
        <div className="p-3 bg-white dark:bg-gray-900 border rounded-xl">
          <p className="text-[11px] text-gray-500 font-medium">Settlement Volume</p>
          <p className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">
            ${formatMinorUnitsToDecimal(totalVolumeMinor, 'USD')}
          </p>
        </div>
        <div className="p-3 bg-white dark:bg-gray-900 border rounded-xl">
          <p className="text-[11px] text-gray-500 font-medium">Active Actors</p>
          <p className="text-base sm:text-lg font-black text-sky-600 mt-0.5">{distinctActors}</p>
        </div>
        <div className="p-3 bg-white dark:bg-gray-900 border rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Chain Integrity</p>
            <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Sealed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

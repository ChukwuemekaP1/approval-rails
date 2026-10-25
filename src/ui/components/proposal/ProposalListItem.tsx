'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProposalDTO } from '@/application/proposal/proposal-dto';
import { ProposalStatusBadge } from './ProposalStatusBadge';

interface ProposalListItemProps {
  proposal: ProposalDTO;
}

export function ProposalListItem({ proposal: p }: ProposalListItemProps) {
  return (
    <Link
      href={`/app/proposals/${p.id}`}
      className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-sky-500 rounded-2xl shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900 dark:text-white">{p.merchant}</span>
          <span className="text-[11px] text-gray-400">• {p.items.length} item(s)</span>
        </div>
        <div className="text-xs text-gray-500">
          Total: <span className="font-extrabold text-gray-900 dark:text-white">{p.currency} {p.totalAmount}</span>
        </div>
        <div className="text-[10px] text-gray-400 font-mono truncate max-w-md">
          Hash: {p.termsHash.slice(0, 24)}...
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ProposalStatusBadge status={p.status} expiresAt={p.expiresAt} />
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </Link>
  );
}

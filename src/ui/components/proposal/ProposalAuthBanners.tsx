'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, CreditCard, Loader2 } from 'lucide-react';

interface AuthorizedProps {
  authorizedAt: string | null;
  onCreateOrder?: () => Promise<void>;
  isLoading: boolean;
}

export function AuthorizedBanner({ authorizedAt, onCreateOrder, isLoading }: AuthorizedProps) {
  return (
    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Mandate Authorized</h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Verified {authorizedAt ? new Date(authorizedAt).toLocaleTimeString() : ''}
          </p>
        </div>
      </div>
      {onCreateOrder && (
        <button
          onClick={onCreateOrder}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Create PayPal Order
        </button>
      )}
    </div>
  );
}

export function AwaitingApprovalBanner() {
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Awaiting Business Manager Approval
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            A manager must review and approve this business request before payment authorization.
          </p>
        </div>
      </div>
      <Link
        href="/app/approvals"
        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 text-center"
      >
        View Approvals
      </Link>
    </div>
  );
}

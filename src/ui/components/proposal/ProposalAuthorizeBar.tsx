'use client';

import React from 'react';
import { ProposalStatus } from '@/domain/proposal/types';
import { Lock, Unlock, Fingerprint, CheckCircle2, Loader2, AlertCircle, CreditCard } from 'lucide-react';

interface Props {
  status: ProposalStatus;
  policyPassed: boolean;
  isExpired: boolean;
  onSeal: () => Promise<void>;
  onUnseal: () => Promise<void>;
  onAuthorize: () => Promise<void>;
  onCreateOrder?: () => Promise<void>;
  isLoading: boolean;
  authorizedAt: string | null;
  authorizedBy: string | null;
}

export const ProposalAuthorizeBar: React.FC<Props> = ({
  status,
  policyPassed,
  isExpired,
  onSeal,
  onUnseal,
  onAuthorize,
  onCreateOrder,
  isLoading,
  authorizedAt,
}) => {
  if (status === 'AUTHORIZED') {
    return (
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Mandate Authorized via Hardware Passkey
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Cryptographically verified at {authorizedAt ? new Date(authorizedAt).toLocaleString() : ''}
            </p>
          </div>
        </div>
        {onCreateOrder && (
          <button
            onClick={onCreateOrder}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Create PayPal Order
          </button>
        )}
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="p-4 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center gap-2 text-stone-600 dark:text-stone-400 text-xs">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>This proposal has expired. Re-create or revise terms to proceed.</span>
      </div>
    );
  }

  if (!policyPassed) {
    return (
      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>This proposal violates workspace policy and cannot be sealed or authorized.</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          {status === 'SEALED' ? 'Mandate Sealed' : 'Review Terms'}
        </h4>
        <p className="text-xs text-slate-500">
          {status === 'SEALED'
            ? 'Terms locked. Sign with WebAuthn passkey to authorize.'
            : 'Lock terms to generate authorization challenge.'}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          WebAuthn proves authenticator assertion bound to terms hash.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {status === 'NEEDS_REVIEW' && (
          <button
            onClick={onSeal}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Seal Exact Terms
          </button>
        )}

        {status === 'SEALED' && (
          <>
            <button
              onClick={onUnseal}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              Unseal to Revise
            </button>

            <button
              onClick={onAuthorize}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal hover:bg-teal-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Fingerprint className="w-4 h-4" />
              )}
              Authorize Terms with Passkey
            </button>
          </>
        )}
      </div>
    </div>
  );
};

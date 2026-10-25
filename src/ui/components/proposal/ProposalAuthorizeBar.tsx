'use client';

import React from 'react';
import { ProposalStatus } from '@/domain/proposal/types';
import { Lock, Unlock, Fingerprint, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { AuthorizedBanner, AwaitingApprovalBanner } from './ProposalAuthBanners';

interface Props {
  status: ProposalStatus;
  policyPassed: boolean;
  isExpired: boolean;
  onSeal: () => Promise<void>;
  onUnseal: () => Promise<void>;
  onAuthorize: () => Promise<void>;
  onAuthorizePin?: (pin?: string) => Promise<void>;
  onCreateOrder?: () => Promise<void>;
  isLoading: boolean;
  authorizedAt: string | null;
}

export const ProposalAuthorizeBar: React.FC<Props> = ({
  status,
  policyPassed,
  isExpired,
  onSeal,
  onUnseal,
  onAuthorize,
  onAuthorizePin,
  onCreateOrder,
  isLoading,
  authorizedAt,
}) => {
  if (status === 'AUTHORIZED') {
    return <AuthorizedBanner authorizedAt={authorizedAt} onCreateOrder={onCreateOrder} isLoading={isLoading} />;
  }

  if (status === 'AWAITING_APPROVAL' || status === 'SUBMITTED_FOR_APPROVAL') {
    return <AwaitingApprovalBanner />;
  }

  if (isExpired) {
    return (
      <div className="p-4 bg-stone-100 dark:bg-stone-900 border rounded-xl flex items-center gap-2 text-xs text-stone-600">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Proposal expired. Re-create or revise terms.</span>
      </div>
    );
  }

  if (!policyPassed) {
    return (
      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Violates policy and cannot be sealed.</span>
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
          {status === 'SEALED' ? 'Terms locked. Authorize with passkey or PIN.' : 'Lock terms to seal.'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {status === 'NEEDS_REVIEW' && (
          <button
            onClick={onSeal}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-lg"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg"
            >
              <Unlock className="w-3.5 h-3.5" /> Unseal to Revise
            </button>

            <button
              onClick={onAuthorize}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
              Authorize Terms with Passkey
            </button>

            {onAuthorizePin && (
              <button
                onClick={() => {
                  const p = window.prompt('Authorization PIN or Password:', '123456');
                  if (p) onAuthorizePin(p);
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg"
              >
                <KeyRound className="w-4 h-4" /> PIN
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

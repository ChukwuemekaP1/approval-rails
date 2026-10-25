'use client';

import React from 'react';
import { PolicyEvaluationResult } from '@/domain/policy/types';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface Props {
  evaluation: PolicyEvaluationResult;
  policyVersion: number;
  policyHash: string;
}

export const ProposalPolicyCard: React.FC<Props> = ({
  evaluation,
  policyVersion,
  policyHash,
}) => {
  const isApproved = evaluation.status === 'APPROVED';
  const requiresAdmin = evaluation.status === 'REQUIRES_ADMIN_APPROVAL';

  return (
    <div
      className={`p-4 rounded-xl border text-xs ${
        isApproved
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
          : requiresAdmin
          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
          : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isApproved ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : requiresAdmin ? (
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <ShieldX className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          )}
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">
              Policy Compliance: {evaluation.status}
            </span>
            <span className="text-[11px] text-slate-500">
              Evaluated against Policy v{policyVersion} (SHA-256:{' '}
              <span className="font-mono">{policyHash.slice(0, 10)}...</span>)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {evaluation.reasons.map((reason) => (
          <span
            key={reason}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
              reason === 'POLICY_OK'
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                : reason === 'REQUIRES_ADMIN_AUTHORIZATION'
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                : 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300'
            }`}
          >
            {reason}
          </span>
        ))}
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { ProposalStatus } from '@/domain/proposal/types';
import { Clock, CheckCircle2, ShieldAlert, Lock, AlertCircle } from 'lucide-react';

interface Props {
  status: ProposalStatus;
  expiresAt: string;
}

export const ProposalStatusBadge: React.FC<Props> = ({ status, expiresAt }) => {
  const isExpired = new Date(expiresAt) < new Date() && status !== 'AUTHORIZED';

  const badgeConfig: Record<ProposalStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    DRAFT: {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      text: 'Draft',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    AWAITING_APPROVAL: {
      bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      text: 'Awaiting Manager Approval',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    SUBMITTED_FOR_APPROVAL: {
      bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      text: 'Submitted for Approval',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    NEEDS_REVIEW: {
      bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      text: 'Needs Review',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    BLOCKED: {
      bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      text: 'Policy Blocked',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    SEALED: {
      bg: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      text: 'Sealed (Ready for Passkey)',
      icon: <Lock className="w-3.5 h-3.5" />,
    },
    AUTHORIZED: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      text: 'Authorized Mandate',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    EXPIRED: {
      bg: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400',
      text: 'Expired',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    CANCELLED: {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
      text: 'Cancelled',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
  };

  const config = isExpired ? badgeConfig.EXPIRED : badgeConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
      >
        {config.icon}
        {config.text}
      </span>
      {status !== 'AUTHORIZED' && (
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {isExpired ? 'Expired' : `Expires ${new Date(expiresAt).toLocaleTimeString()}`}
        </span>
      )}
    </div>
  );
};

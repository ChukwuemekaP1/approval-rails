'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { FormattedPolicyDTO } from './types';

interface Props {
  workspaceName?: string;
  activePolicy: FormattedPolicyDTO | null;
  errorMsg: string | null;
  successMsg: string | null;
}

export function PolicyPageHeader({ workspaceName, activePolicy, errorMsg, successMsg }: Props) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal">
              Deterministic Policy Engine
            </span>
            <span className="text-xs text-slate-400">Workspace: {workspaceName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Spend Policies & Limits
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Authoritative, version-controlled spending rules evaluated on the server prior to purchase mandate authorization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activePolicy && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Version {activePolicy.version} Active</span>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1"><span className="font-semibold">Policy Error: </span>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-3 text-emerald-700 dark:text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1"><span className="font-semibold">Success: </span>{successMsg}</div>
        </div>
      )}

      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3.5">
        <Info className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <span className="font-semibold text-slate-900 dark:text-white">Immutable Policy Binding (Invariant 6):</span>
          <p>When a proposal is sealed, it records the exact active policy version and SHA-256 hash. Publishing a new policy version never mutates earlier proposals or mandates.</p>
        </div>
      </div>
    </>
  );
}

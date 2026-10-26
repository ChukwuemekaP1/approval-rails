'use client';

import React from 'react';
import { User, Building2, Check, ArrowRight } from 'lucide-react';

interface Props {
  workspaceType: 'PERSONAL' | 'BUSINESS';
  onSelect: (type: 'PERSONAL' | 'BUSINESS') => void;
  onNext: () => void;
}

export function OnboardingStepSphere({ workspaceType, onSelect, onNext }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choose Your Workspace Sphere</h2>
        <p className="text-xs text-slate-500 mt-1">
          Select how you plan to use ApproveRail. You can always create or join additional workspaces later.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSelect('PERSONAL')}
          className={`p-5 rounded-2xl border-2 text-left transition-all ${
            workspaceType === 'PERSONAL'
              ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 shadow-md ring-1 ring-teal-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
              <User className="w-5 h-5" />
            </div>
            {workspaceType === 'PERSONAL' && <Check className="w-5 h-5 text-teal-600" />}
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal Workspace</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Individual purchasing with personal spending limits. Direct cryptographic consent without manager queues.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-teal-600 font-semibold">
            ✓ Instant Passkey/PIN authorization
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect('BUSINESS')}
          className={`p-5 rounded-2xl border-2 text-left transition-all ${
            workspaceType === 'BUSINESS'
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md ring-1 ring-indigo-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
              <Building2 className="w-5 h-5" />
            </div>
            {workspaceType === 'BUSINESS' && <Check className="w-5 h-5 text-indigo-600" />}
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Business Organization</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Multi-member procurement with authoritative manager signoff, policy enforcement, and team spending controls.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-indigo-600 font-semibold">
            ✓ Manager approval gates & audit logs
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
      >
        <span>Continue to Policy & Limits Setup</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

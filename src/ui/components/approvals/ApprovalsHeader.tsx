'use client';

import React from 'react';
import { Clock, ShieldCheck } from 'lucide-react';

interface Props {
  workspaceName?: string;
  activeTab: 'pending' | 'history';
  setActiveTab: (tab: 'pending' | 'history') => void;
  pendingCount: number;
  historyCount: number;
}

export function ApprovalsHeader(props: Props) {
  const { workspaceName, activeTab, setActiveTab, pendingCount, historyCount } = props;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Business Approvals</h1>
        <p className="text-xs text-slate-500">Manager review and decision queue for {workspaceName}</p>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'pending' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600' : 'text-slate-500'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'history' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600' : 'text-slate-500'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> History ({historyCount})
        </button>
      </div>
    </div>
  );
}

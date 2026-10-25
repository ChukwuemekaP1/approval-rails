'use client';

import React from 'react';

interface Props {
  history: Array<{
    approval: {
      id: string;
      proposalId: string;
      decision: string;
      reason: string | null;
      createdAt: string | Date;
    };
    approver: {
      displayName: string;
    };
  }>;
}

export function ApprovalHistoryList({ history }: Props) {
  if (history.length === 0) {
    return <p className="text-xs text-slate-500 text-center py-10">No decision records yet.</p>;
  }

  return (
    <div className="space-y-3">
      {history.map(({ approval, approver }) => (
        <div
          key={approval.id}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
        >
          <div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                approval.decision === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {approval.decision}
            </span>
            <p className="text-slate-900 dark:text-white font-medium mt-1">
              Proposal #{approval.proposalId.slice(0, 8)}
            </p>
            {approval.reason && <p className="text-[11px] text-slate-500 mt-0.5">&quot;{approval.reason}&quot;</p>}
          </div>
          <div className="text-right text-[11px] text-slate-500">
            <p>Decided by {approver.displayName}</p>
            <p className="text-[10px] font-mono mt-0.5">{new Date(approval.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

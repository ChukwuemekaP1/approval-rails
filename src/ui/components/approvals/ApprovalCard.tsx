'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, Shield, Clock, AlertTriangle, User, Eye, Loader2 } from 'lucide-react';

interface Props {
  proposal: any;
  currentUserId: string;
  onApprove: (proposalId: string) => void;
  onReject: (proposalId: string, reason: string) => void;
  isProcessing?: boolean;
}

export function ApprovalCard({ proposal, currentUserId, onApprove, onReject, isProcessing }: Props) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isSelf = proposal.requesterId === currentUserId;

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full">
            {proposal.merchant}
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            Procurement Request #{proposal.id.slice(0, 8)}
          </h3>
        </div>

        <div className="text-right">
          <span className="text-base font-extrabold text-slate-900 dark:text-white block">
            {proposal.formattedTotalAmount || `$${(Number(proposal.totalAmountMinor) / 100).toFixed(2)}`}
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1 justify-end">
            <User className="w-3 h-3" /> Requester: {proposal.requesterId?.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {proposal.items?.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span className="line-clamp-1 pr-2">
              <span className="font-semibold text-teal-600">{item.quantity}x</span> {item.title}
            </span>
            <span className="font-medium shrink-0">{item.formattedTotalPrice || `$${(Number(item.totalPriceMinor) / 100).toFixed(2)}`}</span>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px] text-slate-500 font-mono flex items-center justify-between">
        <span className="truncate pr-2">Hash: {proposal.termsHash?.slice(0, 24)}...</span>
        <span className="text-emerald-600 font-semibold shrink-0">Policy Passed</span>
      </div>

      {isSelf && (
        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Self-approval is blocked by policy. Another manager or owner must approve this request.</span>
        </div>
      )}

      {showRejectInput ? (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (e.g. Budget reallocation, duplicate item)..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowRejectInput(false)}
              className="py-1 px-3 text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => onReject(proposal.id, rejectReason)}
              disabled={isProcessing}
              className="py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Link
            href={`/app/proposals/${proposal.id}`}
            className="py-1.5 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" /> Details
          </Link>
          <button
            onClick={() => setShowRejectInput(true)}
            disabled={isSelf || isProcessing}
            className="py-1.5 px-3 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>
          <button
            onClick={() => onApprove(proposal.id)}
            disabled={isSelf || isProcessing}
            className="py-1.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" /> Approve Request
          </button>
        </div>
      )}
    </div>
  );
}

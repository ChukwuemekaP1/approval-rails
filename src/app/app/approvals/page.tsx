'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { ApprovalCard } from '@/ui/components/approvals/ApprovalCard';
import { ApprovalHistoryList } from '@/ui/components/approvals/ApprovalHistoryList';
import { ApprovalsHeader } from '@/ui/components/approvals/ApprovalsHeader';

export default function ApprovalsPage() {
  const { activeWorkspace, principal } = useAuth();
  const [data, setData] = useState<{ pending: any[]; history: any[] }>({ pending: [], history: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/approvals`);
      if (res.ok) setData(await res.json());
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading approvals');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const handleApprove = async (proposalId: string) => {
    if (!activeWorkspace?.id) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/proposals/${proposalId}/approve`, {
        method: 'POST',
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.detail || resData.title || 'Approval failed');
      setFeedback('Proposal approved. Moved to user authorization.');
      loadApprovals();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (proposalId: string, reason: string) => {
    if (!activeWorkspace?.id) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/proposals/${proposalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.detail || resData.title || 'Rejection failed');
      setFeedback('Proposal rejected. Budget reservations released.');
      loadApprovals();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Rejection error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
        <span className="text-xs">Loading approval queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ApprovalsHeader
        workspaceName={activeWorkspace?.name}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={data.pending.length}
        historyCount={data.history.length}
      />

      {feedback && (
        <div className="p-3 rounded-xl bg-teal-50 text-teal-800 text-xs flex items-center gap-2 border border-teal-200">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === 'pending' ? (
        data.pending.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Approval queue is clear</h3>
            <p className="text-xs text-slate-500 mt-1">No requests are currently awaiting review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.pending.map((proposal) => (
              <ApprovalCard
                key={proposal.id}
                proposal={proposal}
                currentUserId={principal?.id || ''}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )
      ) : (
        <ApprovalHistoryList history={data.history} />
      )}
    </div>
  );
}

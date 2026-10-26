'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Loader2, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { usePurchaseRequest } from '@/ui/hooks/usePurchaseRequest';
import { PurchaseRequestHeader } from '@/ui/components/purchases/PurchaseRequestHeader';
import { PurchaseSynthesisBox } from '@/ui/components/purchases/PurchaseSynthesisBox';
import { PurchaseCandidateList } from '@/ui/components/purchases/PurchaseCandidateList';

export default function PurchaseRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params?.requestId as string;
  const { isAuthenticated, isLoading: authLoading, activeWorkspace } = useAuth();

  const { request, isLoading, isRetrying, errorMsg, setErrorMsg, retryResearch } =
    usePurchaseRequest(activeWorkspace?.id, requestId, isAuthenticated);

  const [creatingCandidateId, setCreatingCandidateId] = useState<string | null>(null);

  const handleCreateProposal = async (candidateId: string) => {
    if (!activeWorkspace?.id || !requestId) return;
    setCreatingCandidateId(candidateId);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceRequestId: requestId, items: [{ candidateId, quantity: 1 }] }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to create proposal');
      }
      const data = await res.json();
      router.push(`/app/proposals/${data.proposal.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating proposal');
      setCreatingCandidateId(null);
    }
  };

  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
        <p className="text-xs text-slate-500">Loading purchase request...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <Lock className="w-10 h-10 text-brand-teal mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Authentication Required</h2>
        <p className="text-xs text-slate-500 mt-1">Sign in to view purchase request details.</p>
        <Link href="/auth" className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-brand-teal hover:bg-teal-600 text-white font-medium text-xs rounded-lg transition-colors">
          Sign In with Passkey <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Request Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{errorMsg || 'The requested purchase request does not exist in this workspace.'}</p>
        <Link href="/app/purchases/new" className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-brand-teal hover:bg-teal-600 text-white font-medium text-xs rounded-lg transition-colors">
          Create New Request <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <PurchaseRequestHeader
        request={request}
        workspaceName={activeWorkspace?.name}
        isRetrying={isRetrying}
        onRetry={retryResearch}
      />

      {errorMsg && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {request.summary && <PurchaseSynthesisBox summary={request.summary} />}

      <PurchaseCandidateList
        candidates={request.candidates}
        recommendedCandidateId={request.summary?.recommendedCandidateId}
        comparisons={request.summary?.comparisons}
        onCreateProposal={handleCreateProposal}
        creatingCandidateId={creatingCandidateId}
      />
    </div>
  );
}

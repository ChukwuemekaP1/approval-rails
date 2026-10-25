'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ShoppingBag,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Building2,
  DollarSign,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { PurchaseRequestDTO } from '@/application/purchase/purchase-use-cases';
import { SUPPORTED_CURRENCIES } from '@/domain/money/currency';

export default function PurchaseRequestDetailPage() {
  const params = useParams();
  const requestId = params?.requestId as string;
  const { isAuthenticated, isLoading: authLoading, activeWorkspace } = useAuth();

  const [request, setRequest] = useState<PurchaseRequestDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    if (!activeWorkspace?.id || !requestId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/purchases/${requestId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to load purchase request');
      }
      const data = await res.json();
      setRequest(data.request);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading purchase request');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id, requestId]);

  useEffect(() => {
    if (isAuthenticated && activeWorkspace?.id && requestId) {
      fetchRequest();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeWorkspace?.id, requestId, fetchRequest]);

  const handleRetryResearch = async () => {
    if (!activeWorkspace?.id || !requestId) return;
    setIsRetrying(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/purchases/${requestId}/research`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Research retry failed');
      }
      const data = await res.json();
      setRequest(data.request);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error retrying research');
    } finally {
      setIsRetrying(false);
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

  const symbol = SUPPORTED_CURRENCIES[request.currency]?.symbol || '$';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-teal/10 text-brand-teal">
              Discovery & Research
            </span>
            <span className="text-[11px] text-slate-400">ID: {request.id.slice(0, 8)}...</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {request.intent}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Created {new Date(request.createdAt).toLocaleString()} in workspace {activeWorkspace?.name}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {request.status === 'COMPLETED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Research Completed
            </span>
          )}
          {request.status === 'RESEARCHING' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
              Research In Progress
            </span>
          )}
          {request.status === 'FAILED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              Research Failed
            </span>
          )}
          {request.status === 'DRAFT' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5" />
              Draft Request
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Constraints Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Target Budget</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {request.budget ? `${symbol}${request.budget}` : 'No explicit cap'}
          </p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Currency</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {request.currency}
          </p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Category</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {request.category || 'General'}
          </p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Preferred Vendor</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {request.preferredMerchant || 'Any verified'}
          </p>
        </div>
      </div>

      {/* Action / Retry Banner for DRAFT or FAILED */}
      {(request.status === 'DRAFT' || request.status === 'FAILED') && (
        <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {request.status === 'FAILED' ? 'Catalog Research Failed' : 'Ready for Catalog Research'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {request.failureReason || 'Query catalog providers and synthesize options with the AI research assistant.'}
            </p>
          </div>
          <button
            onClick={handleRetryResearch}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-teal hover:bg-teal-600 text-white font-medium text-xs rounded-xl disabled:opacity-50 transition-colors shadow-sm"
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running Research...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{request.status === 'FAILED' ? 'Retry Research' : 'Start Research'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* AI Research Synthesis Box */}
      {request.summary && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-teal">
            <Sparkles className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              AI Research Synthesis
            </h2>
          </div>
          <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {request.summary.summaryMarkdown}
          </div>
          {request.summary.recommendationReason && (
            <div className="p-3 bg-brand-teal/5 border border-brand-teal/20 rounded-xl text-xs text-slate-700 dark:text-slate-200">
              <span className="font-semibold text-brand-teal">Top Recommendation: </span>
              {request.summary.recommendationReason}
            </div>
          )}
        </div>
      )}

      {/* Discovered Candidates Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Catalog Candidates ({request.candidates.length})</span>
          <span className="text-[11px] text-slate-400 font-normal">Authoritative snapshots with source attribution</span>
        </h2>

        {request.candidates.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-500">
            No product candidates have been retrieved yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.candidates.map((c) => {
              const isRecommended = request.summary?.recommendedCandidateId === c.id;
              const comparison = request.summary?.comparisons.find((comp) => comp.candidateId === c.id);

              return (
                <div
                  key={c.id}
                  className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm flex flex-col justify-between transition-all ${
                    isRecommended
                      ? 'border-brand-teal ring-1 ring-brand-teal/40'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {c.merchant}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 uppercase">
                          {c.providerId}
                        </span>
                        {isRecommended && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal text-white">
                            Recommended
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        c.availabilityStatus === 'IN_STOCK'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {c.availabilityStatus}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                      {c.title}
                    </h3>

                    {c.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {c.description}
                      </p>
                    )}

                    {comparison && (
                      <div className="pt-2 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                        {comparison.strengths.length > 0 && (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3 h-3 shrink-0" />
                            <span>{comparison.strengths[0]}</span>
                          </div>
                        )}
                        {comparison.bestFor && (
                          <div className="text-slate-400 italic">
                            Best for: {comparison.bestFor}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      {c.price ? (
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          {SUPPORTED_CURRENCIES[c.currency || 'USD']?.symbol || '$'}{c.price} <span className="text-[10px] text-slate-400 font-normal">{c.currency}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          Price Unconfirmed
                        </span>
                      )}
                    </div>

                    <a
                      href={c.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-teal hover:underline font-medium"
                    >
                      <span>View Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

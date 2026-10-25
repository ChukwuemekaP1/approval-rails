'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Lock, ArrowRight, Loader2, AlertTriangle, Plus } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { PurchaseRequestDTO } from '@/application/purchase/purchase-use-cases';
import { PurchaseListItem } from '@/ui/components/purchase/PurchaseListItem';

export default function PurchasesListPage() {
  const { isAuthenticated, isLoading: authLoading, activeWorkspace } = useAuth();
  const [requests, setRequests] = useState<PurchaseRequestDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/purchases`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to load purchase requests');
      }
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading purchase requests');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (isAuthenticated && activeWorkspace?.id) {
      fetchRequests();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeWorkspace?.id, fetchRequests]);

  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs text-gray-500">Loading purchase requests...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
        <Lock className="w-10 h-10 text-sky-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Authentication Required</h2>
        <p className="text-xs text-gray-500 mt-1">Sign in to view workspace purchase requests.</p>
        <Link href="/auth" className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-sky-600 text-white font-medium text-xs rounded-lg">
          Sign In with Passkey <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
            Phase 4: AI Research & Catalog Snapshots
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
            Purchases
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Natural-language requests and catalog discovery.
          </p>
        </div>

        <Link
          href="/app/purchases/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Request
        </Link>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="p-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-center space-y-3">
          <ShoppingCart className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Purchase Requests</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Explain what you need and AI will discover catalog items.
          </p>
          <div className="pt-2">
            <Link
              href="/app/purchases/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold"
            >
              Start Request <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {requests.map((r) => (
            <PurchaseListItem key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}

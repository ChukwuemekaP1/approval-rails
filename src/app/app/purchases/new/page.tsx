'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { NewPurchaseForm } from '@/ui/components/purchases/NewPurchaseForm';

export default function NewPurchaseRequestPage() {
  const { isAuthenticated, isLoading: authLoading, activeWorkspace } = useAuth();

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
        <p className="text-sm text-slate-500">Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <Lock className="w-10 h-10 text-brand-teal mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Authentication Required</h2>
        <p className="text-xs text-slate-500 mt-1">Sign in with your passkey to create a purchase request.</p>
        <Link
          href="/auth"
          className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-brand-teal hover:bg-teal-600 text-white font-medium text-xs rounded-lg transition-colors"
        >
          Sign In with Passkey <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <Building2 className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">No Active Workspace</h2>
        <p className="text-xs text-slate-500 mt-1">Select or create a workspace before submitting purchase requests.</p>
        <Link
          href="/app/workspaces"
          className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-brand-teal hover:bg-teal-600 text-white font-medium text-xs rounded-lg transition-colors"
        >
          Go to Workspaces <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal">
            Discovery & Research
          </span>
          <span className="text-xs text-slate-400">Workspace: {activeWorkspace.name}</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
          New Purchase Request
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Describe the items or service you need. Our AI research assistant will query verified catalog sources and present comparisons.
        </p>
      </div>

      <NewPurchaseForm workspaceId={activeWorkspace.id} />
    </div>
  );
}

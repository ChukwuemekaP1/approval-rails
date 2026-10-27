'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Building2, ArrowRight } from 'lucide-react';

interface Props {
  isAuthenticated: boolean;
  hasActiveWorkspace: boolean;
}

export function PolicyEmptyStates({ isAuthenticated, hasActiveWorkspace }: Props) {
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Required</h2>
        <p className="text-sm text-slate-500 mt-2">Sign in with your passkey to inspect and author workspace spend policies.</p>
        <Link href="/auth" className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-brand-teal hover:bg-teal-600 text-white font-medium text-sm rounded-lg transition-colors">
          Sign In with Passkey <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (!hasActiveWorkspace) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Active Workspace</h2>
        <p className="text-sm text-slate-500 mt-2">Select or initialize a workspace to view and manage its authoritative spending policies.</p>
        <Link href="/app/workspaces" className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-brand-teal hover:bg-teal-600 text-white font-medium text-sm rounded-lg transition-colors">
          Go to Workspaces <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return null;
}

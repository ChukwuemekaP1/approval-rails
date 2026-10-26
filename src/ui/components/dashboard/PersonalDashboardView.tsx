'use client';

import React from 'react';
import Link from 'next/link';
import { User, ShoppingCart, ShoppingBag, ShieldCheck, FileCheck2, Sparkles } from 'lucide-react';
import { AuthWorkspace } from '@/ui/context/AuthContext';
import { useWorkspaceDashboard } from './useWorkspaceDashboard';
import { PersonalDashboardCards } from './PersonalDashboardCards';

interface Props {
  workspace: AuthWorkspace;
}

export function PersonalDashboardView({ workspace }: Props) {
  const { policy, basketCount, proposalsCount, isLoading } = useWorkspaceDashboard(workspace.id, false);
  const sym = policy?.currency === 'EUR' ? '€' : policy?.currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <User className="w-3 h-3" /> Personal Workspace
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{workspace.name}</h1>
          <p className="text-xs text-gray-500">Personal purchasing with authoritative spending limits.</p>
        </div>

        <Link
          href="/app/shop"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" /> Start Shopping
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 shadow-sm space-y-1">
          <p className="text-xs text-gray-500 font-medium">Monthly Cap</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {policy?.monthlyBudgetCap ? `${sym}${policy.monthlyBudgetCap}` : 'Not set'}
          </p>
          <p className="text-[10px] text-gray-400">Enforced policy limit</p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 shadow-sm space-y-1">
          <p className="text-xs text-gray-500 font-medium">Transaction Cap</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {policy?.maxTransactionAmount ? `${sym}${policy.maxTransactionAmount}` : 'Not set'}
          </p>
          <p className="text-[10px] text-gray-400">Single order limit</p>
        </div>

        <Link
          href="/app/cart"
          className="p-4 rounded-xl border bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/50 hover:border-teal-400 shadow-sm space-y-1"
        >
          <div className="flex items-center justify-between text-teal-700 dark:text-teal-300">
            <span className="text-xs font-semibold">Basket</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-teal-800 dark:text-teal-200">{basketCount} Items</p>
          <p className="text-[10px] text-teal-600">Active cart</p>
        </Link>

        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold">Proposals</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">{proposalsCount}</p>
          <p className="text-[10px] text-gray-400">Direct consent mode</p>
        </div>
      </div>

      {proposalsCount === 0 && !isLoading && (
        <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-teal-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Ready</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not created any purchase proposals yet. Search products in the catalog to get started.
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <Link href="/app/shop" className="py-1.5 px-3 rounded-lg bg-teal-600 text-white text-xs font-semibold">
              Browse Catalog
            </Link>
            <Link href="/app/policies" className="py-1.5 px-3 rounded-lg border text-xs font-semibold">
              Review Limits
            </Link>
          </div>
        </div>
      )}

      <PersonalDashboardCards />
    </div>
  );
}

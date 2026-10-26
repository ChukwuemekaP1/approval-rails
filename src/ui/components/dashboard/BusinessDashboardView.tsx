'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, ClipboardCheck, Store, Users, Sparkles } from 'lucide-react';
import { AuthWorkspace } from '@/ui/context/AuthContext';
import { useWorkspaceDashboard } from './useWorkspaceDashboard';
import { BusinessDashboardCards } from './BusinessDashboardCards';

interface Props {
  workspace: AuthWorkspace;
}

export function BusinessDashboardView({ workspace }: Props) {
  const { policy, approvalsCount, membersCount, proposalsCount, isLoading } = useWorkspaceDashboard(workspace.id, true);
  const sym = policy?.currency === 'EUR' ? '€' : policy?.currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <Building2 className="w-3 h-3" /> Business Organization
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {workspace.role || 'MEMBER'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{workspace.name}</h1>
          <p className="text-xs text-gray-500">Multi-member procurement, managerial approvals, and policy-governed spending.</p>
        </div>

        <Link
          href="/app/shop"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-sky-600 hover:bg-sky-700 shadow-sm"
        >
          <Store className="w-4 h-4" /> Enterprise Catalog
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 shadow-sm space-y-1">
          <p className="text-xs text-gray-500 font-medium">Monthly Budget</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {policy?.monthlyBudgetCap ? `${sym}${policy.monthlyBudgetCap}` : 'Not set'}
          </p>
          <p className="text-[10px] text-gray-400">Authoritative workspace limit</p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 shadow-sm space-y-1">
          <p className="text-xs text-gray-500 font-medium">Transaction Cap</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {policy?.maxTransactionAmount ? `${sym}${policy.maxTransactionAmount}` : 'Not set'}
          </p>
          <p className="text-[10px] text-gray-400">Policy limit per order</p>
        </div>

        <Link
          href="/app/approvals"
          className="p-4 rounded-xl border bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 hover:border-amber-400 shadow-sm space-y-1"
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
            <span className="text-xs font-semibold">Approvals Queue</span>
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-amber-800 dark:text-amber-200">{approvalsCount} Pending</p>
          <p className="text-[10px] text-amber-600">Pending manager signoff</p>
        </Link>

        <Link
          href="/app/workspaces"
          className="p-4 rounded-xl border bg-white dark:bg-gray-900 hover:border-sky-400 shadow-sm space-y-1"
        >
          <div className="flex items-center justify-between text-sky-600">
            <span className="text-xs font-semibold">Team Members</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">{membersCount} Members</p>
          <p className="text-[10px] text-gray-400">Manage member spending caps</p>
        </Link>
      </div>

      {proposalsCount === 0 && !isLoading && (
        <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Organization Ready</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active proposals or approval requests yet. Start by discovering products or inviting purchasing members.
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <Link href="/app/shop" className="py-1.5 px-3 rounded-lg bg-sky-600 text-white text-xs font-semibold">
              Search Catalog
            </Link>
            <Link href="/app/workspaces" className="py-1.5 px-3 rounded-lg border text-xs font-semibold">
              Invite Members
            </Link>
          </div>
        </div>
      )}

      <BusinessDashboardCards />
    </div>
  );
}

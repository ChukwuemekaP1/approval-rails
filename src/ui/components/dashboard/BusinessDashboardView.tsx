'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, ClipboardCheck, Store, Users } from 'lucide-react';
import { AuthWorkspace } from '@/ui/context/AuthContext';
import { BusinessDashboardCards } from './BusinessDashboardCards';

interface Props {
  workspace: AuthWorkspace;
}

export function BusinessDashboardView({ workspace }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <Building2 className="w-3 h-3" /> Business Organization Workspace
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {workspace.role || 'MEMBER'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
            {workspace.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Multi-member procurement, managerial approvals, and policy-governed spending.
          </p>
        </div>

        <Link
          href="/app/shop"
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors min-h-[40px]"
        >
          <Store className="w-4 h-4 mr-1.5" /> Enterprise Hardware Catalog
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 shadow-sm space-y-2">
          <p className="text-xs text-gray-500 font-medium">Monthly Workspace Budget</p>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">$50,000.00</p>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full w-[24%]" />
          </div>
          <p className="text-[10px] text-gray-400">24% utilized this billing period</p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 shadow-sm space-y-1">
          <p className="text-xs text-gray-500 font-medium">Single Transaction Cap</p>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">$10,000.00</p>
          <p className="text-[10px] text-gray-400">Authoritative policy ceiling</p>
        </div>

        <Link
          href="/app/approvals"
          className="p-4 rounded-xl border bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 hover:border-amber-400 transition-colors shadow-sm space-y-1"
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
            <span className="text-xs font-semibold">Approvals Queue</span>
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-200">Active</p>
          <p className="text-[10px] text-amber-600">Pending manager signoff</p>
        </Link>

        <Link
          href="/app/workspaces"
          className="p-4 rounded-xl border bg-white dark:bg-gray-900 hover:border-sky-400 transition-colors shadow-sm space-y-1"
        >
          <div className="flex items-center justify-between text-sky-600">
            <span className="text-xs font-semibold">Team Members</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Active Team</p>
          <p className="text-[10px] text-gray-400">Manage member spending caps</p>
        </Link>
      </div>

      <BusinessDashboardCards />
    </div>
  );
}

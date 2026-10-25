'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  FileCheck2,
  ShieldCheck,
  Clock,
  ArrowRight,
  Layers,
  ScrollText,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';

export default function DashboardPage() {
  const { isAuthenticated, activeWorkspace } = useAuth();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
            Proposals & Passkey Mandates
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
            ApproveRail Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            AI-Assisted Purchasing with Cryptographic Consent and Policy Invariants
          </p>
        </div>

        <Link
          href="/app/purchases/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-semibold rounded-xl text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors min-h-[40px]"
        >
          <ShoppingCart className="w-4 h-4 mr-1.5" /> New Request
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/app/purchases"
          className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-sky-500 shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="p-2 w-fit rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 mb-3">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Purchases</h3>
            <p className="text-xs text-gray-500 mt-1">Catalog discovery via Channel3 & AI synthesis.</p>
          </div>
          <div className="flex items-center text-xs font-medium text-sky-600 pt-3">
            View Requests <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          href="/app/proposals"
          className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-sky-500 shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="p-2 w-fit rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Proposals & Mandates</h3>
            <p className="text-xs text-gray-500 mt-1">RFC 8785 canonical hash & passkey authorization.</p>
          </div>
          <div className="flex items-center text-xs font-medium text-emerald-600 pt-3">
            Review Proposals <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          href="/app/policies"
          className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-sky-500 shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="p-2 w-fit rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 mb-3">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Spend Policies</h3>
            <p className="text-xs text-gray-500 mt-1">Authoritative versioned limits in integer minor units.</p>
          </div>
          <div className="flex items-center text-xs font-medium text-purple-600 pt-3">
            Manage Policies <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          href="/app/transactions"
          className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-sky-500 shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="p-2 w-fit rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Settlement</h3>
            <p className="text-xs text-gray-500 mt-1">PayPal Orders v2 capture status.</p>
          </div>
          <div className="flex items-center text-xs font-medium text-amber-600 pt-3">
            View Activity <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>
      </div>

      <div className="p-5 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/30 flex items-start gap-3">
        <Lock className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
        <div className="text-xs text-sky-900 dark:text-sky-200 space-y-1">
          <p className="font-bold">Active Workspace: {activeWorkspace?.name || 'Default Workspace'}</p>
          <p>
            Deterministic policy evaluation enforces spend controls server-side. Passkeys prove user presence and consent bound to exact termsHash.
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Clock,
  FileCheck2,
  ShieldAlert,
  ArrowRight,
  Server,
  Layers,
  ScrollText,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
            Phase 1: Application Shell Active
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
            ApproveRail Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI-Assisted Purchasing with Cryptographic Consent and Policy Invariants
          </p>
        </div>

        <Link
          href="/app/purchases/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[44px]"
        >
          <ShoppingCart className="w-4 h-4 mr-2" aria-hidden="true" />
          New Purchase Request
        </Link>
      </div>

      {/* Greenfield Status Notice */}
      <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Phase 1 Greenfield Architecture
            </h2>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              This deployment is running the foundational architecture shell. In accordance with project instructions, incomplete features do not use fake mock data. Each destination below links to its planned screen and clearly outlines the phase boundaries and security invariants that govern it.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Destinations */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Core Workflow Destinations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/app/purchases/new"
            className="group p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-sky-500 dark:hover:border-sky-500 transition-all shadow-sm flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  Phase 4
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                New Purchase Request
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter purchasing needs in plain text; AI researches catalog via Channel3.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-sky-600 dark:text-sky-400 pt-3">
              Open Request Form <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            href="/app/policies"
            className="group p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-sky-500 dark:hover:border-sky-500 transition-all shadow-sm flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  Phase 3
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                Spend Policies
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Deterministic versioned policy enforcement. Integer minor unit spend limits.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-sky-600 dark:text-sky-400 pt-3">
              View Policies <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            href="/app/transactions"
            className="group p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-sky-500 dark:hover:border-sky-500 transition-all shadow-sm flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  Phase 6
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                Activity & Settlement
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PayPal Orders v2 capture status, idempotent webhooks, explicit state transitions.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-sky-600 dark:text-sky-400 pt-3">
              View Activity <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* System Diagnostics & Operations */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Operational & Audit Controls
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/app/ledger"
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition"
          >
            <div className="flex items-center gap-2 mb-1">
              <ScrollText className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Operational Ledger</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Append-only tamper-evident event timeline and hash chaining (Phase 7).
            </p>
          </Link>

          <Link
            href="/app/workspaces"
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition"
          >
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Workspaces</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Multi-tenant workspace isolation enforced at repository queries (Phase 2).
            </p>
          </Link>

          <Link
            href="/api/v1/health"
            target="_blank"
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition"
          >
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Health Probes</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Inspect live JSON at <code>/api/v1/health</code> & <code>/api/v1/readiness</code>.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

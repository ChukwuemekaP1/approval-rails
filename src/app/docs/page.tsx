import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, CheckCircle2, Lock, FileCode2 } from 'lucide-react';

export const metadata = {
  title: 'Architecture & Specifications | ApproveRail',
  description: 'ApproveRail Greenfield Architecture, 15 Invariants, and Phase Specifications',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col justify-between">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
            Approve<span className="text-sky-600 dark:text-sky-400">Rail</span> Docs
          </span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-sky-600"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 w-full">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
            System Specifications
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            ApproveRail Architecture & Invariants
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Deterministic server-side purchasing controls, AI research bounds, and cryptographic human consent.
          </p>
        </div>

        <section className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-600" />
            Core Invariant Principles
          </h2>
          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2 list-disc pl-5">
            <li><strong>AI Isolation:</strong> AI recommends catalog items but never holds payment keys or authorizes transactions.</li>
            <li><strong>RFC 8785 Canonical Terms:</strong> Proposal terms are serialized deterministically and hashed with SHA-256 before authorization.</li>
            <li><strong>WebAuthn Cryptographic Consent:</strong> Single-use challenge bound to exact termsHash proves human presence.</li>
            <li><strong>Integer Minor Units:</strong> All financial calculations use bigint integer cents to prevent floating-point drift.</li>
            <li><strong>Multi-Tenant Isolation:</strong> Enforced at repository query boundaries with foreign keys and cascade rules.</li>
          </ul>
        </section>

        <section className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Phased Roadmap Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Phases 1–5: Completed</span>
              <p className="text-gray-500 mt-0.5">Shell, WebAuthn auth, policy engine, catalog research, and proposal lifecycle.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl">
              <span className="font-bold text-sky-600 dark:text-sky-400">Phases 6–7: Next Phases</span>
              <p className="text-gray-500 mt-0.5">PayPal Orders v2 capture, webhooks, and append-only cryptographic audit ledger.</p>
            </div>
          </div>
        </section>

        <div className="flex justify-center pt-2">
          <Link
            href="/app"
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
          >
            Launch Application Shell
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 text-center text-xs text-gray-500">
        ApproveRail Greenfield Modular Monolith • Documentation
      </footer>
    </div>
  );
}

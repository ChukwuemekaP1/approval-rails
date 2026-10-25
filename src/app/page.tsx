import Link from 'next/link';
import { ShieldCheck, ArrowRight, CheckCircle2, Lock, FileCode2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col justify-between">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
            Approve<span className="text-sky-600 dark:text-sky-400">Rail</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Passkey Sign In
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            Open App Shell <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12 w-full">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            Phase 1 Greenfield Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            AI Can Recommend. <br />
            <span className="text-sky-600 dark:text-sky-400">Only Humans Authorize.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            ApproveRail binds AI purchasing assistance to deterministic server-side policies,
            cryptographic human consent, and an auditable tamper-evident evidence trail.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[44px]"
            >
              Enter Application Shell
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[44px]"
            >
              <FileCode2 className="w-4 h-4 mr-2" />
              Architecture Docs
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">15 Non-Negotiable Invariants</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI output is strictly untrusted data and never receives payment signing keys. Calculations use integer minor units and deterministic policy evaluation.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Modular Monolith</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Next.js App Router, TypeScript strict mode, Zod boundary validation, PostgreSQL with Drizzle ORM, Vitest, and Playwright. Zero microservice bloat.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Operational Readiness</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              RFC 9457 structured errors, correlation ID tracing, structured logging with secret redaction, and accurate database readiness probes.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 text-center text-xs text-gray-500">
        ApproveRail Greenfield Modular Monolith • Phase 1
      </footer>
    </div>
  );
}

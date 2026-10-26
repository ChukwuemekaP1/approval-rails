'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, KeyRound, CheckCircle2, Lock } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 dark:opacity-20 pointer-events-none">
        <div className="w-[600px] h-[600px] bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-full blur-[140px] animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 shadow-sm animate-bounce duration-1000">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>AI-Assisted Procurement with Cryptographic Governance</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          AI proposes. You authorize. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-indigo-600 bg-clip-text text-transparent">
            Every payment leaves proof.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Discover products with AI assistance, refine exact purchasing specs, and compare live merchant offers.
          No purchase executes without deterministic spending limits, manager approval, and cryptographic consent.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/25 hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <span>Get Started / Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-850"
          >
            <span>Sign In to Workspace</span>
          </Link>
        </div>

        <div className="pt-8 max-w-3xl mx-auto">
          <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-teal-600 font-bold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> 1. Discovery
                </div>
                <p className="text-[11px] text-slate-500">Live multi-merchant search & requirements card.</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 2. Server Policy
                </div>
                <p className="text-[11px] text-slate-500">Authoritative caps in integer minor units.</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs mb-1">
                  <KeyRound className="w-3.5 h-3.5" /> 3. Human Consent
                </div>
                <p className="text-[11px] text-slate-500">Passkey / PIN signoff on exact terms hash.</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
                  <Lock className="w-3.5 h-3.5" /> 4. Ledger Proof
                </div>
                <p className="text-[11px] text-slate-500">PayPal settlement with hash-chain audit log.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

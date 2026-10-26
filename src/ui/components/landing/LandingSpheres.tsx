'use client';

import React from 'react';
import { User, Building2, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export function LandingSpheres() {
  return (
    <section id="spheres" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400">
          Tailored Workspaces
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Personal Autonomy & Business Governance
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          ApproveRail supports both individual procurement and enterprise multi-member organizations under strict server-enforced policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal Workspace</h3>
              <p className="text-xs text-slate-500">For freelancers, creators, and individuals</p>
            </div>
          </div>
          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <span>Personal spending limits prevent impulse or runaway purchasing.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <span>Direct approval mode: authorize your own purchases with Passkey or PIN.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <span>Complete personal audit history exported to CSV or AG Grid.</span>
            </li>
          </ul>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Business Organization</h3>
              <p className="text-xs text-slate-500">For companies, agencies, and teams</p>
            </div>
          </div>
          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>Multi-tenant member roles: Owner, Manager, and Purchaser.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>Enforced segregation of duties: requesters cannot approve their own high-value orders.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>Custom approval thresholds: route proposals exceeding specific amounts to managers.</span>
            </li>
          </ul>
        </div>
      </div>

      <div id="security" className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Non-Negotiable Security Invariants</h3>
            <p className="text-xs text-slate-400">Guaranteed by architecture, verified in automated test suites</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <p className="font-bold text-white">AI is Untrusted</p>
            <p className="text-[11px] text-slate-400">AI can recommend products but never receives payment keys or authorizes orders.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <p className="font-bold text-white">Integer Minor Units</p>
            <p className="text-[11px] text-slate-400">Zero floating-point money. Calculations use BigInt cents to avoid precision drift.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <p className="font-bold text-white">SHA-256 Hash Chaining</p>
            <p className="text-[11px] text-slate-400">Every event links cryptographically to prior records with verifiable integrity.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

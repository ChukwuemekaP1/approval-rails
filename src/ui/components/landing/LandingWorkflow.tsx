'use client';

import React from 'react';
import { Search, ShoppingBag, ShieldAlert, CreditCard } from 'lucide-react';

export function LandingWorkflow() {
  const steps = [
    {
      num: '01',
      icon: Search,
      title: 'AI Discovery & Requirement Refinement',
      desc: 'Type any product query. For broad requests, our refinement card gathers desired brand, condition, and price range before searching live Channel3 merchant offers.',
      badge: 'Genuine Live Catalog',
      color: 'teal',
    },
    {
      num: '02',
      icon: ShoppingBag,
      title: 'Persistent Multi-Item Basket',
      desc: 'Build procurement baskets across multiple independent searches. Select one or all items to generate an authoritative purchase proposal with frozen prices.',
      badge: 'Zero Cart Loss',
      color: 'indigo',
    },
    {
      num: '03',
      icon: ShieldAlert,
      title: 'Deterministic Spending Policies',
      desc: 'Every purchase is evaluated against authoritative server policies. Business workspaces enforce separation of duties, requiring designated manager signoff.',
      badge: 'Integer Minor Units',
      color: 'purple',
    },
    {
      num: '04',
      icon: CreditCard,
      title: 'Passkey Consent & Verified Settlement',
      desc: 'Authorize payments cryptographically using WebAuthn passkeys or secure PIN. Settled via PayPal Orders v2 with an immutable SHA-256 audit ledger.',
      badge: 'Cryptographic Proof',
      color: 'emerald',
    },
  ];

  return (
    <section id="workflow" className="py-20 bg-slate-50/50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400">
            End-to-End Governance
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How Procurement Works on ApproveRail
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            From natural-language need to auditable settlement without AI hallucinations or unauthorized spending.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700">{s.num}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {s.badge}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

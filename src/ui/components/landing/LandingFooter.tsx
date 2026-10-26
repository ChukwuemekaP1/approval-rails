'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-850">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                Approve<span className="text-teal-600">Rail</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              AI proposes. You authorize. Every payment leaves proof.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Link href="/signup" className="hover:text-teal-600 transition-colors">Create Account</Link>
            <Link href="/login" className="hover:text-teal-600 transition-colors">Sign In</Link>
            <Link href="/auth" className="hover:text-teal-600 transition-colors">Passkey Portal</Link>
            <Link href="/docs" className="hover:text-teal-600 transition-colors">Architecture Docs</Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} ApproveRail. Cryptographic Consent & Multi-Tenant Procurement.</p>
          <p>Strictly integer minor-unit financial precision • SHA-256 Hash Chain Ledger</p>
        </div>
      </div>
    </footer>
  );
}

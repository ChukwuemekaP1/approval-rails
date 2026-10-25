'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ClipboardCheck, FileCheck2, ScrollText, ArrowRight } from 'lucide-react';

export function BusinessDashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Link
        href="/app/shop"
        className="p-4 rounded-xl border bg-white dark:bg-gray-900 hover:border-sky-500 transition-colors flex flex-col justify-between shadow-sm"
      >
        <div>
          <div className="p-2 w-fit rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 mb-2">
            <Store className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Shop Catalog</h3>
          <p className="text-xs text-gray-500 mt-1">Multi-merchant Channel3 hardware discovery.</p>
        </div>
        <span className="flex items-center text-xs font-semibold text-sky-600 pt-3">
          Search Hardware <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </Link>

      <Link
        href="/app/approvals"
        className="p-4 rounded-xl border bg-white dark:bg-gray-900 hover:border-sky-500 transition-colors flex flex-col justify-between shadow-sm"
      >
        <div>
          <div className="p-2 w-fit rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 mb-2">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Manager Approvals</h3>
          <p className="text-xs text-gray-500 mt-1">Review team proposals against terms hash.</p>
        </div>
        <span className="flex items-center text-xs font-semibold text-amber-600 pt-3">
          Open Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </Link>

      <Link
        href="/app/policies"
        className="p-4 rounded-xl border bg-white dark:bg-gray-900 hover:border-sky-500 transition-colors flex flex-col justify-between shadow-sm"
      >
        <div>
          <div className="p-2 w-fit rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 mb-2">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Policy Engine</h3>
          <p className="text-xs text-gray-500 mt-1">Authoritative transaction limits & rules.</p>
        </div>
        <span className="flex items-center text-xs font-semibold text-purple-600 pt-3">
          Configure Rules <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </Link>

      <Link
        href="/app/ledger"
        className="p-4 rounded-xl border bg-white dark:bg-gray-900 hover:border-sky-500 transition-colors flex flex-col justify-between shadow-sm"
      >
        <div>
          <div className="p-2 w-fit rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mb-2">
            <ScrollText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Audit Grid</h3>
          <p className="text-xs text-gray-500 mt-1">AG Grid hash-chained governance events.</p>
        </div>
        <span className="flex items-center text-xs font-semibold text-emerald-600 pt-3">
          Analyze Spheres <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </Link>
    </div>
  );
}

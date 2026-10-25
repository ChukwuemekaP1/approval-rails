'use client';

import React from 'react';
import Link from 'next/link';
import { User, ShoppingCart, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import { AuthWorkspace } from '@/ui/context/AuthContext';
import { PersonalDashboardCards } from './PersonalDashboardCards';

interface Props {
  workspace: AuthWorkspace;
}

export function PersonalDashboardView({ workspace }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <User className="w-3 h-3" /> Personal Procurement Workspace
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              Direct Authorization Mode
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
            {workspace.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Personal purchasing with authoritative spending limits and cryptographic passkey consent.
          </p>
        </div>

        <Link
          href="/app/shop"
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors min-h-[40px]"
        >
          <ShoppingCart className="w-4 h-4 mr-1.5" /> Start Shopping
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 shadow-sm space-y-2">
          <p className="text-xs text-gray-500 font-medium">Personal Monthly Budget</p>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">$2,500.00</p>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full w-[12%]" />
          </div>
          <p className="text-[10px] text-gray-400">12% utilized this month</p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 shadow-sm space-y-1">
          <p className="text-xs text-gray-500 font-medium">Personal Transaction Limit</p>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">$1,000.00</p>
          <p className="text-[10px] text-gray-400">Per-order policy limit</p>
        </div>

        <Link
          href="/app/cart"
          className="p-4 rounded-xl border bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/50 hover:border-teal-400 transition-colors shadow-sm space-y-1"
        >
          <div className="flex items-center justify-between text-teal-700 dark:text-teal-300">
            <span className="text-xs font-semibold">Active Basket</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-teal-800 dark:text-teal-200">Cart Ready</p>
          <p className="text-[10px] text-teal-600">Select items to procure</p>
        </Link>

        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold">Approval Free</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Instant</p>
          <p className="text-[10px] text-gray-400">Direct user consent with Passkey/PIN</p>
        </div>
      </div>

      <PersonalDashboardCards />
    </div>
  );
}

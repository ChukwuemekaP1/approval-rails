'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ShoppingBag, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export function PersonalDashboardCards() {
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
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Shop & Discovery</h3>
          <p className="text-xs text-gray-500 mt-1">Multi-search hardware discovery across suppliers.</p>
        </div>
        <span className="flex items-center text-xs font-semibold text-sky-600 pt-3">
          Explore Products <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </Link>

      <Link
        href="/app/cart"
        className="p-4 rounded-xl border bg-white dark:bg-gray-900 hover:border-sky-500 transition-colors flex flex-col justify-between shadow-sm"
      >
        <div>
          <div className="p-2 w-fit rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 mb-2">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Persistent Basket</h3>
          <p className="text-xs text-gray-500 mt-1">Select 1, several, or all items to procure.</p>
        </div>
        <span className="flex items-center text-xs font-semibold text-teal-600 pt-3">
          View Cart <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </Link>

      <Link
        href="/app/proposals"
        className="p-4 rounded-xl border bg-white dark:bg-gray-900 hover:border-sky-500 transition-colors flex flex-col justify-between shadow-sm"
      >
        <div>
          <div className="p-2 w-fit rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Passkey Mandates</h3>
          <p className="text-xs text-gray-500 mt-1">Direct instant authorization with passkey or PIN.</p>
        </div>
        <span className="flex items-center text-xs font-semibold text-emerald-600 pt-3">
          Review Mandates <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </Link>

      <Link
        href="/app/transactions"
        className="p-4 rounded-xl border bg-white dark:bg-gray-900 hover:border-sky-500 transition-colors flex flex-col justify-between shadow-sm"
      >
        <div>
          <div className="p-2 w-fit rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Orders & Settlement</h3>
          <p className="text-xs text-gray-500 mt-1">PayPal sandbox checkout & capture status.</p>
        </div>
        <span className="flex items-center text-xs font-semibold text-amber-600 pt-3">
          View Activity <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </Link>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Layers } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Link
          href="/app"
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-sky-500 rounded p-1"
          aria-label="ApproveRail Home"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-base tracking-tight font-extrabold text-sky-900 dark:text-sky-300">
            Approve<span className="text-sky-600 dark:text-sky-400">Rail</span>
          </span>
        </Link>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Phase 1: Shell Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/app/workspaces"
          className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[36px]"
          aria-label="Current Workspace: Default Sandbox"
        >
          <Layers className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
          <span className="truncate max-w-[120px] sm:max-w-[160px]">Default Workspace</span>
        </Link>

        <Link
          href="/auth"
          className="inline-flex items-center justify-center text-xs font-semibold px-2.5 py-1.5 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-white focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[36px]"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}

import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RoutePlaceholderProps {
  title: string;
  routePath: string;
  targetPhase: string;
  description: string;
  securityInvariantsNote?: string;
  nextSteps?: string[];
}

export function RoutePlaceholder({
  title,
  routePath,
  targetPhase,
  description,
  securityInvariantsNote,
  nextSteps,
}: RoutePlaceholderProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            {targetPhase}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
            {title}
          </h1>
          <p className="text-sm font-mono text-gray-500 dark:text-gray-400">{routePath}</p>
        </div>
        <Link
          href="/app"
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back to Overview
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Honest Greenfield Placeholder
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {securityInvariantsNote && (
          <div className="mt-4 p-4 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Security Invariant Context
            </h3>
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
              {securityInvariantsNote}
            </p>
          </div>
        )}

        {nextSteps && nextSteps.length > 0 && (
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Planned Deliverables for this Screen:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400">
              {nextSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

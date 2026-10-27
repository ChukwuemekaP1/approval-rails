'use client';

import React from 'react';
import { FormattedPolicyDTO } from './types';

interface Props {
  version: FormattedPolicyDTO;
  onClose: () => void;
}

export function PolicyInspectModal({ version: v, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Version {v.version}: {v.name}</h3>
            <span className="text-xs text-slate-500">Created {new Date(v.createdAt).toLocaleString()}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold">
            Close
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Full SHA-256 Content Hash</span>
            <p className="font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg text-slate-700 dark:text-slate-300 break-all select-all">
              {v.contentHash}
            </p>
          </div>

          <div>
            <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Canonical Content (JSON)</span>
            <pre className="p-3 bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto max-h-60">
              {JSON.stringify(JSON.parse(v.canonicalContent), null, 2)}
            </pre>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, Hash } from 'lucide-react';

interface Props {
  termsHash: string;
  canonicalTermsJson: string;
}

export const ProposalTermsDigest: React.FC<Props> = ({ termsHash, canonicalTermsJson }) => {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(termsHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-brand-teal shrink-0" />
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Canonical Mandate Digest (RFC 8785 SHA-256):
          </span>
        </div>
        <div className="flex items-center gap-2">
          <code className="bg-white dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate max-w-[260px] sm:max-w-xs">
            {termsHash}
          </code>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
            title="Copy SHA-256 Hash"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setShowJson(!showJson)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium text-[11px]"
        >
          {showJson ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          {showJson ? 'Hide RFC 8785 Canonical JSON' : 'Inspect RFC 8785 Canonical JSON'}
        </button>

        {showJson && (
          <pre className="mt-2 p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
            {canonicalTermsJson}
          </pre>
        )}
      </div>
    </div>
  );
};

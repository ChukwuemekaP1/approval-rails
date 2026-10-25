'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Filter, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { LedgerEntry } from '@/domain/ledger/types';
import { LedgerEntriesView } from '@/ui/components/ledger/LedgerEntriesView';
import { AuditLedgerGrid } from '@/ui/components/ledger/AuditLedgerGrid';

export default function LedgerPage() {
  const { isAuthenticated, isLoading: authLoading, activeWorkspace } = useAuth();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'timeline'>('grid');
  const [eventType, setEventType] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLedger = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setIsLoading(true);
    try {
      const q = eventType !== 'ALL' ? `?eventType=${eventType}` : '';
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/ledger${q}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id, eventType]);

  useEffect(() => {
    if (isAuthenticated && activeWorkspace?.id) fetchLedger();
    else if (!authLoading) setIsLoading(false);
  }, [isAuthenticated, activeWorkspace?.id, authLoading, fetchLedger]);

  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-7 h-7 text-sky-600 animate-spin" />
        <p className="text-xs text-gray-500">Loading ledger...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border rounded-xl text-center">
        <Lock className="w-8 h-8 text-sky-600 mx-auto mb-2" />
        <p className="text-sm font-bold text-gray-900">Sign in to view workspace ledger.</p>
        <Link href="/auth" className="mt-4 inline-block px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <span className="text-[11px] font-bold text-sky-600 uppercase">Cryptographic Audit Trail</span>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Operational Ledger</h1>
          <p className="text-xs text-gray-500">Tamper-evident hash-chained sequence of workspace events.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/verify" className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Offline Verifier
          </Link>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg text-xs">
            <button onClick={() => setViewMode('grid')} className={`px-2.5 py-1 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm font-semibold text-sky-700' : 'text-gray-500'}`}>Audit Grid</button>
            <button onClick={() => setViewMode('table')} className={`px-2.5 py-1 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm font-semibold' : 'text-gray-500'}`}>Table</button>
            <button onClick={() => setViewMode('timeline')} className={`px-2.5 py-1 rounded-md ${viewMode === 'timeline' ? 'bg-white shadow-sm font-semibold' : 'text-gray-500'}`}>Timeline</button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="px-2 py-1 border rounded-lg bg-white text-xs">
            <option value="ALL">All Event Types</option>
            <option value="REQUEST_CREATED">REQUEST_CREATED</option>
            <option value="TERMS_SEALED">TERMS_SEALED</option>
            <option value="AUTHORIZATION_VERIFIED">AUTHORIZATION_VERIFIED</option>
            <option value="ORDER_CREATED">ORDER_CREATED</option>
            <option value="CAPTURE_COMPLETED">CAPTURE_COMPLETED</option>
            <option value="WEBHOOK_PROCESSED">WEBHOOK_PROCESSED</option>
          </select>
        </div>
        <span className="text-gray-400">{entries.length} events</span>
      </div>

      {viewMode === 'grid' ? (
        <AuditLedgerGrid entries={entries} isLoading={isLoading} />
      ) : (
        <LedgerEntriesView entries={entries} viewMode={viewMode} />
      )}
    </div>
  );
}

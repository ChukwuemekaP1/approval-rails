'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { OrderDTO } from '@/application/payment/order-dto';
import { OrderStatusBadge } from '@/ui/components/order/OrderStatusBadge';
import { LedgerEntry } from '@/domain/ledger/types';

export default function TransactionDetailPage() {
  const params = useParams();
  const transactionId = params?.transactionId as string;
  const { isAuthenticated, isLoading: authLoading, activeWorkspace } = useAuth();

  const [transaction, setTransaction] = useState<OrderDTO | null>(null);
  const [events, setEvents] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!activeWorkspace?.id || !transactionId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/transactions/${transactionId}`);
      const data = await res.json();
      if (res.ok) {
        setTransaction(data.transaction);
        setEvents(data.events || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id, transactionId]);

  useEffect(() => {
    if (isAuthenticated && activeWorkspace?.id) fetchDetail();
    else if (!authLoading) setIsLoading(false);
  }, [isAuthenticated, activeWorkspace?.id, authLoading, fetchDetail]);

  const handleExport = () => {
    if (!activeWorkspace?.id || !transactionId) return;
    window.open(`/api/v1/workspaces/${activeWorkspace.id}/ledger/export?streamId=${transactionId}`, '_blank');
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-7 h-7 text-sky-600 animate-spin" />
        <p className="text-xs text-gray-500">Loading details...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white dark:bg-gray-900 border rounded-xl text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-xs font-bold text-gray-900">Not Found</p>
        <Link href="/app/transactions" className="mt-3 inline-block text-xs text-sky-600">Back</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <Link href="/app/transactions" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          <Download className="w-3.5 h-3.5" /> Export Evidence
        </button>
      </div>

      <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <span className="text-[11px] text-gray-400 font-mono">ID: {transaction.id}</span>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{transaction.merchant}</h1>
          </div>
          <OrderStatusBadge status={transaction.status} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-gray-400 block">Amount</span>
            <span className="font-extrabold text-gray-900 dark:text-white">{transaction.currency} {transaction.amount}</span>
          </div>
          <div>
            <span className="text-gray-400 block">PayPal ID</span>
            <span className="font-mono">{transaction.paypalOrderId || '—'}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Capture ID</span>
            <span className="font-mono">{transaction.captureId || '—'}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Date</span>
            <span>{new Date(transaction.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600" /> Evidence Timeline
        </h3>
        {events.length === 0 ? (
          <p className="text-xs text-gray-400 italic p-4 bg-white border rounded-xl">No ledger events recorded.</p>
        ) : (
          <div className="space-y-2">
            {events.map((ev) => (
              <div key={ev.id} className="p-3 bg-white dark:bg-gray-900 border rounded-xl flex justify-between text-xs gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-100 font-bold">#{ev.sequence}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{ev.eventType}</span>
                    <span className="text-[10px] text-gray-400">by {ev.actor.kind}</span>
                  </div>
                  <div className="text-[11px] font-mono text-gray-400 truncate max-w-sm">Hash: {ev.hash}</div>
                </div>
                <span className="text-[11px] text-gray-400">{new Date(ev.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { History, RefreshCw } from 'lucide-react';

export interface DeliveryLogItem {
  id: string;
  eventType: string;
  status: 'PENDING' | 'DISPATCHED' | 'FAILED' | 'DEAD_LETTER';
  attempts: number;
  lastHttpStatus: number | null;
  lastError: string | null;
  summary: string;
  createdAt: string;
}

interface Props {
  history: DeliveryLogItem[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export function OutboxDeliveryHistory({ history, onRefresh, isLoading }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Delivery Log & Audit Trail</h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-xs text-gray-500 py-6 text-center">No notifications dispatched yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 border-b">
              <tr>
                <th className="p-2.5">Event</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">HTTP</th>
                <th className="p-2.5">Attempts</th>
                <th className="p-2.5">Summary</th>
                <th className="p-2.5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {history.map((item) => {
                const statusColor =
                  item.status === 'DISPATCHED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : item.status === 'PENDING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <tr key={item.id}>
                    <td className="p-2.5 font-semibold text-gray-800 dark:text-gray-200">{item.eventType}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColor}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-gray-500">
                      {item.lastHttpStatus ? `HTTP ${item.lastHttpStatus}` : '-'}
                    </td>
                    <td className="p-2.5 text-gray-500">{item.attempts} / 5</td>
                    <td className="p-2.5 text-gray-600 dark:text-gray-400 max-w-xs truncate" title={item.summary}>
                      {item.summary}
                    </td>
                    <td className="p-2.5 text-gray-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

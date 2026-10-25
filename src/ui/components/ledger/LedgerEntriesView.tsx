'use client';

import React from 'react';
import { LedgerEntry } from '@/domain/ledger/types';

interface Props {
  entries: LedgerEntry[];
  viewMode: 'table' | 'timeline';
}

export function LedgerEntriesView({ entries, viewMode }: Props) {
  if (entries.length === 0) {
    return <div className="p-8 bg-white border rounded-xl text-center text-xs text-gray-500">No events found.</div>;
  }

  if (viewMode === 'table') {
    return (
      <div className="overflow-x-auto bg-white dark:bg-gray-900 border rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b text-gray-500">
            <tr>
              <th className="p-3">Seq</th>
              <th className="p-3">Event</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Hash</th>
              <th className="p-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((ev) => (
              <tr key={ev.id}>
                <td className="p-3 font-mono font-bold">#{ev.sequence}</td>
                <td className="p-3 font-semibold">{ev.eventType}</td>
                <td className="p-3 text-gray-500">{ev.actor.kind}</td>
                <td className="p-3 font-mono text-[11px] text-emerald-600">{ev.hash.slice(0, 14)}...</td>
                <td className="p-3 text-gray-400">{new Date(ev.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((ev) => (
        <div key={ev.id} className="p-3 bg-white dark:bg-gray-900 border rounded-xl flex items-start gap-3 text-xs">
          <span className="p-1 rounded font-mono font-bold text-[10px] bg-slate-100">#{ev.sequence}</span>
          <div className="flex-1 space-y-0.5">
            <div className="flex justify-between font-bold">
              <span>{ev.eventType}</span>
              <span className="text-[11px] font-normal text-gray-400">{new Date(ev.timestamp).toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-gray-500">Actor: {ev.actor.kind} ({ev.actor.id})</div>
            <div className="text-[10px] text-gray-400 font-mono truncate">Prev: {ev.prevHash.slice(0, 12)}... ➔ Hash: {ev.hash.slice(0, 12)}...</div>
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { LedgerEntry } from '@/domain/ledger/types';
import { Search, Download, Loader2, AlertCircle } from 'lucide-react';
import { formatMinorUnitsToDecimal } from '@/domain/money/currency';

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  entries: LedgerEntry[];
  isLoading?: boolean;
  error?: string | null;
}

export function AuditLedgerGrid({ entries, isLoading, error }: Props) {
  const gridRef = useRef<AgGridReact>(null);
  const [quickFilterText, setQuickFilterText] = useState('');

  const onExportCsv = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `approve-rail-ledger-${new Date().toISOString().slice(0, 10)}.csv`,
    });
  }, []);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Seq',
        field: 'sequence',
        width: 85,
        sort: 'desc',
        cellRenderer: (p: any) => <span className="font-mono font-bold">#{p.value}</span>,
      },
      {
        headerName: 'Timestamp',
        field: 'timestamp',
        width: 175,
        valueFormatter: (p: any) => (p.value ? new Date(p.value).toLocaleString() : '-'),
      },
      {
        headerName: 'Correlation ID',
        field: 'correlationId',
        width: 145,
        cellRenderer: (p: any) => (
          <span className="font-mono text-[11px] text-gray-500 truncate" title={p.value}>
            {p.value}
          </span>
        ),
      },
      {
        headerName: 'Event Type',
        field: 'eventType',
        width: 195,
        cellRenderer: (p: any) => {
          const ev = String(p.value);
          const color = ev.includes('COMPLETED') || ev.includes('SEALED')
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : ev.includes('FAILED') || ev.includes('DENIED')
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-amber-50 text-amber-700 border-amber-200';
          return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color}`}>
              {ev}
            </span>
          );
        },
      },
      {
        headerName: 'Actor',
        valueGetter: (p: any) => `${p.data.actor?.kind || 'SYSTEM'} (${p.data.actor?.id || '-'})`,
        width: 155,
      },
      {
        headerName: 'Amount',
        valueGetter: (p: any) => {
          const payload = p.data?.payload;
          if (payload?.amountMinor) {
            const dec = formatMinorUnitsToDecimal(BigInt(payload.amountMinor), payload.currency || 'USD');
            return `${dec} ${payload.currency || ''}`.trim();
          }
          return '-';
        },
        width: 120,
      },
      {
        headerName: 'Predecessor Hash',
        field: 'prevHash',
        width: 150,
        cellRenderer: (p: any) => (
          <span className="font-mono text-[11px] text-gray-400">{p.value ? `${p.value.slice(0, 10)}...` : '-'}</span>
        ),
      },
      {
        headerName: 'Event Hash',
        field: 'hash',
        width: 150,
        cellRenderer: (p: any) => (
          <span className="font-mono text-[11px] text-emerald-600 font-semibold">{p.value ? `${p.value.slice(0, 10)}...` : '-'}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Quick search events, hashes, actors..."
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white dark:bg-gray-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{entries.length} events</span>
          <button
            onClick={onExportCsv}
            disabled={entries.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" /> Export CSV
          </button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900">
        <div className="overflow-x-auto">
          <div className="ag-theme-quartz min-w-[760px] h-[480px]">
            <AgGridReact
              ref={gridRef}
              rowData={entries}
              columnDefs={columnDefs}
              quickFilterText={quickFilterText}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 25, 50]}
              loading={isLoading}
              overlayNoRowsTemplate={error ? `<span class="text-rose-500">${error}</span>` : '<span>No ledger events recorded</span>'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

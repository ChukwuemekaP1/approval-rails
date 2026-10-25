'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { LedgerEntry } from '@/domain/ledger/types';
import { Search, Download, LayoutList, Table } from 'lucide-react';
import { getAuditLedgerColumns } from './AuditLedgerColumns';
import { MobileAuditStream } from './MobileAuditStream';

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  entries: LedgerEntry[];
  isLoading?: boolean;
  error?: string | null;
}

export function AuditLedgerGrid({ entries, isLoading, error }: Props) {
  const gridRef = useRef<AgGridReact>(null);
  const [quickFilterText, setQuickFilterText] = useState('');
  const [mobileMode, setMobileMode] = useState<'cards' | 'grid'>('cards');

  const onExportCsv = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `approve-rail-ledger-${new Date().toISOString().slice(0, 10)}.csv`,
    });
  }, []);

  const columnDefs = useMemo(() => getAuditLedgerColumns(), []);

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

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex sm:hidden bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMobileMode('cards')}
              className={`px-2 py-1 rounded flex items-center gap-1 ${mobileMode === 'cards' ? 'bg-white shadow-sm font-semibold' : 'text-gray-500'}`}
            >
              <LayoutList className="w-3 h-3" /> Cards
            </button>
            <button
              onClick={() => setMobileMode('grid')}
              className={`px-2 py-1 rounded flex items-center gap-1 ${mobileMode === 'grid' ? 'bg-white shadow-sm font-semibold' : 'text-gray-500'}`}
            >
              <Table className="w-3 h-3" /> Grid
            </button>
          </div>

          <span className="text-xs text-gray-400">{entries.length} events</span>

          <button
            onClick={onExportCsv}
            disabled={entries.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 border rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" /> Export CSV
          </button>
        </div>
      </div>

      {mobileMode === 'cards' && (
        <div className="block sm:hidden">
          <MobileAuditStream entries={entries} isLoading={isLoading} />
        </div>
      )}

      <div className={`border rounded-xl overflow-hidden bg-white dark:bg-gray-900 ${mobileMode === 'cards' ? 'hidden sm:block' : 'block'}`}>
        <div className="overflow-x-auto w-full">
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

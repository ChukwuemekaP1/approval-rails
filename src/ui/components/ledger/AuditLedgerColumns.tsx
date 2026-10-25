import React from 'react';
import { ColDef } from 'ag-grid-community';
import { formatMinorUnitsToDecimal } from '@/domain/money/currency';

export function getAuditLedgerColumns(): ColDef[] {
  return [
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
        const color = ev.includes('COMPLETED') || ev.includes('SEALED') || ev.includes('APPROVED')
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : ev.includes('FAILED') || ev.includes('DENIED') || ev.includes('REJECTED')
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
  ];
}

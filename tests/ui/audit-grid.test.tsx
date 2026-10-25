import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuditLedgerGrid } from '@/ui/components/ledger/AuditLedgerGrid';
import LedgerPage from '@/app/app/ledger/page';

vi.mock('@/ui/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    activeWorkspace: { id: 'ws-1', name: 'Acme Corp' },
  }),
}));

describe('AuditLedgerGrid Component (AG Grid Community)', () => {
  const dummyEntries = [
    {
      id: 'e1',
      workspaceId: 'ws-1',
      streamId: 's1',
      correlationId: 'c1',
      sequence: 1,
      eventType: 'ORDER_CREATED' as const,
      actor: { kind: 'USER' as const, id: 'u1' },
      payload: { amountMinor: '5000', currency: 'USD' },
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      timestamp: '2026-10-25T12:00:00Z',
    },
  ];

  it('renders quick search input and export CSV button', () => {
    render(<AuditLedgerGrid entries={dummyEntries} />);
    expect(
      screen.getByPlaceholderText(/quick search events, hashes, actors/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
    expect(screen.getByText(/1 events/i)).toBeInTheDocument();
  });

  it('allows quick filter input typing', () => {
    render(<AuditLedgerGrid entries={dummyEntries} />);
    const input = screen.getByPlaceholderText(/quick search events/i);
    fireEvent.change(input, { target: { value: 'ORDER' } });
    expect(input).toHaveValue('ORDER');
  });
});

describe('LedgerPage with Audit Grid Mode', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          entries: [
            {
              id: 'ev-1',
              workspaceId: 'ws-1',
              streamId: 's1',
              correlationId: 'c1',
              sequence: 1,
              eventType: 'ORDER_CREATED',
              actor: { kind: 'USER', id: 'u1' },
              payload: { amountMinor: '1000', currency: 'USD' },
              prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
              hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              timestamp: '2026-10-25T12:00:00Z',
            },
          ],
        }),
      })
    );
  });

  it('renders Audit Grid tab button by default', async () => {
    render(<LedgerPage />);
    await waitFor(() => {
      expect(screen.getByText(/Audit Grid/i)).toBeInTheDocument();
      expect(screen.getByText(/Table/i)).toBeInTheDocument();
      expect(screen.getByText(/Timeline/i)).toBeInTheDocument();
    });
  });
});

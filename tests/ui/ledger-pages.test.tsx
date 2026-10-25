import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyEvidencePage from '@/app/app/verify/page';
import LedgerPage from '@/app/app/ledger/page';
import { GENESIS_HASH, canonicalizeEntry, computeSha256Hex } from '@/domain/ledger/canonicalize';

vi.mock('@/ui/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    activeWorkspace: { id: 'ws-1', name: 'Acme Corp' },
  }),
}));

describe('Offline Evidence Verifier UI', () => {
  it('renders verifier and validates a pasted bundle', async () => {
    const e1Text = canonicalizeEntry({
      streamId: 's1',
      sequence: 1,
      eventType: 'REQUEST_CREATED',
      timestamp: '2026-10-25T12:00:00Z',
      actor: { kind: 'USER', id: 'u1' },
      payload: { item: 'Desk' },
      prevHash: GENESIS_HASH,
    });
    const h1 = await computeSha256Hex(e1Text);

    const validBundle = {
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      workspaceId: 'ws-1',
      streamId: 's1',
      correlationId: 'c1',
      totalEvents: 1,
      headHash: h1,
      events: [
        {
          id: 'e1',
          workspaceId: 'ws-1',
          streamId: 's1',
          correlationId: 'c1',
          sequence: 1,
          eventType: 'REQUEST_CREATED',
          actor: { kind: 'USER', id: 'u1' },
          payload: { item: 'Desk' },
          prevHash: GENESIS_HASH,
          hash: h1,
          timestamp: '2026-10-25T12:00:00Z',
        },
      ],
    };

    render(<VerifyEvidencePage />);
    expect(screen.getByText(/Offline Evidence Verifier/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/schemaVersion/i);
    fireEvent.change(textarea, { target: { value: JSON.stringify(validBundle) } });

    const btn = screen.getByRole('button', { name: /Verify Cryptographic Integrity/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/Audit Passed: Hash Chain Pristine/i)).toBeInTheDocument();
    });
  });
});

describe('Operational Ledger UI', () => {
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
              streamId: 'stream-xyz',
              correlationId: 'corr-1',
              sequence: 1,
              eventType: 'ORDER_CREATED',
              actor: { kind: 'USER', id: 'u1' },
              payload: { merchant: 'Apple' },
              prevHash: GENESIS_HASH,
              hash: 'abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234',
              timestamp: '2026-10-25T12:00:00Z',
            },
          ],
        }),
      })
    );
  });

  it('renders operational ledger table view and sequence items', async () => {
    render(<LedgerPage />);

    await waitFor(() => {
      expect(screen.getByText(/Operational Ledger/i)).toBeInTheDocument();
      expect(screen.getAllByText(/ORDER_CREATED/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/#1/i)).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ProposalDetailPage from '@/app/app/proposals/[proposalId]/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
  useParams: () => ({ proposalId: 'prop-test-456' }),
}));

const mockUseAuth = vi.fn();
vi.mock('@/ui/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Proposal Review & Mandate UI (ProposalDetailPage)', () => {
  const mockProposal = {
    id: 'prop-test-456',
    workspaceId: 'ws-1',
    requesterId: 'user-1',
    sourceRequestId: 'req-1',
    merchant: 'Keychron',
    currency: 'USD',
    items: [
      {
        id: 'item-1',
        candidateId: 'cand-1',
        title: 'Keychron Q1 Pro Mechanical Keyboard',
        merchant: 'Keychron',
        sourceUrl: 'https://keychron.com/q1',
        quantity: 1,
        unitPrice: '199.99',
        unitPriceMinor: '19999',
        totalPrice: '199.99',
        totalPriceMinor: '19999',
        currency: 'USD',
      },
    ],
    totalAmount: '199.99',
    totalAmountMinor: '19999',
    status: 'NEEDS_REVIEW',
    policyVersion: 1,
    policyHash: 'a1b2c3d4e5f6',
    policyEvaluation: {
      passed: true,
      status: 'APPROVED',
      reasons: ['POLICY_OK'],
      evaluatedPolicyVersion: 1,
      evaluatedPolicyHash: 'a1b2c3d4e5f6',
      evaluatedAt: new Date().toISOString(),
    },
    canonicalTermsJson: '{"currency":"USD"}',
    termsHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    expiresAt: new Date(Date.now() + 1800000).toISOString(),
    authorizedAt: null,
    authorizedBy: null,
    authorizationAssertion: null,
    authChallenge: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders proposal details, policy compliance card, and unsigned basket', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      activeWorkspace: { id: 'ws-1', name: 'Acme Corp' },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ proposal: mockProposal }),
    } as any);

    render(<ProposalDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Mandate Review & Authorization/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Keychron Q1 Pro Mechanical Keyboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Policy Compliance: APPROVED/i)).toBeInTheDocument();
    expect(screen.getByText(/POLICY_OK/i)).toBeInTheDocument();
    expect(screen.getByText(/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Seal Exact Terms/i })).toBeInTheDocument();
  });

  it('handles sealing action and displays passkey authorization bar', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      activeWorkspace: { id: 'ws-1', name: 'Acme Corp' },
    });

    const sealedProposal = {
      ...mockProposal,
      status: 'SEALED',
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proposal: mockProposal }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proposal: sealedProposal }),
      } as any);

    render(<ProposalDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Seal Exact Terms/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Seal Exact Terms/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Authorize Terms with Passkey/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Unseal to Revise/i })).toBeInTheDocument();
    });
  });
});

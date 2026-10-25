import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PoliciesPage from '@/app/app/policies/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockUseAuth = vi.fn();
vi.mock('@/ui/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('PoliciesPage UI Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders authentication prompt when not signed in', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      activeWorkspace: null,
    });

    render(<PoliciesPage />);
    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign In with Passkey/i })).toBeInTheDocument();
  });

  it('renders workspace required prompt when authenticated without active workspace', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      activeWorkspace: null,
    });

    render(<PoliciesPage />);
    expect(screen.getByText(/No Active Workspace/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to Workspaces/i })).toBeInTheDocument();
  });

  it('renders active policy details, tabs, and canonical hash when workspace is selected', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      activeWorkspace: {
        id: 'ws-123',
        name: 'Acme Test Corp',
        type: 'BUSINESS',
        role: 'ADMIN',
      },
    });

    const mockActivePolicy = {
      id: 'pol-1',
      workspaceId: 'ws-123',
      version: 1,
      name: 'Default Spending Policy',
      currency: 'USD',
      maxTransactionAmount: '250.00',
      maxTransactionAmountMinor: '25000',
      monthlyBudgetCap: '1000.00',
      monthlyBudgetCapMinor: '100000',
      requireAdminAbove: '100.00',
      requireAdminAboveMinor: '10000',
      allowedCategories: ['Office', 'Software'],
      blockedMerchants: ['UntrustedVendor'],
      canonicalContent: '{"currency":"USD","maxTransactionAmount":"25000","monthlyBudgetCap":"100000"}',
      contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      isActive: true,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
    };

    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/versions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ versions: [mockActivePolicy] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ policy: mockActivePolicy }),
      } as Response);
    }) as any;

    render(<PoliciesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Spend Policies & Limits/i)).toBeInTheDocument();
      expect(screen.getByText(/Version 1 Active/i)).toBeInTheDocument();
      expect(screen.getByText(/\$250.00/i)).toBeInTheDocument();
      expect(screen.getByText(/\$1000.00/i)).toBeInTheDocument();
      expect(screen.getByText(/Immutable Policy Binding \(Invariant 6\)/i)).toBeInTheDocument();
    });

    // Switch to Policy Editor tab
    const editorTab = screen.getByRole('button', { name: /Policy Editor/i });
    fireEvent.click(editorTab);

    expect(screen.getByText(/Publish New Policy Version/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('250.00')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import NewPurchaseRequestPage from '@/app/app/purchases/new/page';
import PurchaseRequestDetailPage from '@/app/app/purchases/[requestId]/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
  useParams: () => ({ requestId: 'req-test-123' }),
}));

const mockUseAuth = vi.fn();
vi.mock('@/ui/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Purchases UI Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NewPurchaseRequestPage', () => {
    it('renders purchase intent form when authenticated with active workspace', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        activeWorkspace: { id: 'ws-1', name: 'Acme Corp' },
      });

      render(<NewPurchaseRequestPage />);

      expect(screen.getByRole('heading', { name: /New Purchase Request/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e\.g\. Ergonomic mesh office chair/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit & Research Candidates/i })).toBeInTheDocument();
    });
  });

  describe('PurchaseRequestDetailPage', () => {
    it('renders candidate options and AI research synthesis when completed', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        activeWorkspace: { id: 'ws-1', name: 'Acme Corp' },
      });

      const mockRequestDTO = {
        id: 'req-test-123',
        workspaceId: 'ws-1',
        createdBy: 'user-1',
        correlationId: 'corr-1',
        intent: 'Dual motor standing desk',
        budget: '400.00',
        currency: 'USD',
        category: 'Furniture',
        preferredMerchant: null,
        status: 'COMPLETED',
        failureReason: null,
        candidates: [
          {
            id: 'cand-1',
            externalId: 'ext-1',
            providerId: 'fixture',
            merchant: 'DeskStore',
            title: 'Electric Sit-Stand Desk 55 inch',
            description: 'Dual motors with memory presets',
            sourceUrl: 'https://deskstore.example.com/desk',
            price: '389.00',
            priceMinor: '38900',
            currency: 'USD',
            availabilityStatus: 'IN_STOCK',
            observedAt: new Date().toISOString(),
          },
        ],
        summary: {
          summaryMarkdown: 'Evaluated market options. DeskStore offers the best motor warranty.',
          recommendedCandidateId: 'cand-1',
          recommendationReason: 'Best warranty and within budget.',
          comparisons: [
            {
              candidateId: 'cand-1',
              strengths: ['Dual motor'],
              weaknesses: ['Assembly required'],
              bestFor: 'Office workstations',
            },
          ],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ request: mockRequestDTO }),
      } as any);

      render(<PurchaseRequestDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(/Dual motor standing desk/i)).toBeInTheDocument();
        expect(screen.getByText(/Research Completed/i)).toBeInTheDocument();
        expect(screen.getByText(/Electric Sit-Stand Desk 55 inch/i)).toBeInTheDocument();
        expect(screen.getByText(/\$389.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Evaluated market options/i)).toBeInTheDocument();
      });
    });
  });
});

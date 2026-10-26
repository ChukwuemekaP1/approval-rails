import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import OnboardingPage from '@/app/onboarding/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

const mockUseAuth = vi.fn();
vi.mock('@/ui/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Workspace Onboarding UI Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      principal: { id: 'u-1', email: 'test@example.com', displayName: 'Sam Test' },
      activeWorkspace: null,
      refreshSession: vi.fn().mockResolvedValue(undefined),
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, redirectTo: '/app' }),
    });
  });

  it('renders Step 1 allowing user to select between Personal and Business spheres', () => {
    render(<OnboardingPage />);
    expect(screen.getByText(/Choose Your Workspace Sphere/i)).toBeInTheDocument();
    expect(screen.getByText(/Personal Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Business Organization/i)).toBeInTheDocument();
  });

  it('progresses to Step 2 to configure spending limits and completes onboarding', async () => {
    render(<OnboardingPage />);
    fireEvent.click(screen.getByText(/Business Organization/i));
    fireEvent.click(screen.getByRole('button', { name: /Continue to Policy & Limits Setup/i }));

    expect(screen.getByText(/Configure Business Policy/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Acme Corp/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Complete & Enter/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/onboarding/complete',
        expect.objectContaining({ method: 'POST' })
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/app');
    });
  });
});

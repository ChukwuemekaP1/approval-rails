import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import AuthPage from '@/app/auth/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/ui/context/AuthContext', () => ({
  useAuth: () => ({
    refreshSession: vi.fn(),
  }),
}));

describe('AuthPage UI Component', () => {
  it('renders sign-in mode by default with passkey prompt', () => {
    render(<AuthPage />);

    expect(screen.getByRole('heading', { name: /Approve\s*Rail/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Register Passkey/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Authenticate with Passkey/i })).toBeInTheDocument();
  });

  it('switches to register mode when Register Passkey tab is clicked', () => {
    render(<AuthPage />);

    const registerTab = screen.getByRole('tab', { name: /Register Passkey/i });
    fireEvent.click(registerTab);

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Display Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create & Bind Passkey/i })).toBeInTheDocument();
  });
});

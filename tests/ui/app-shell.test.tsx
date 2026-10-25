import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AppHeader } from '@/ui/shell/AppHeader';
import { DesktopSidebar } from '@/ui/shell/DesktopSidebar';
import { MobileBottomNav } from '@/ui/shell/MobileBottomNav';
import { RoutePlaceholder } from '@/ui/components/RoutePlaceholder';

vi.mock('next/navigation', () => ({
  usePathname: () => '/app',
}));

vi.mock('@/ui/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    principal: null,
    activeWorkspace: { id: 'ws-default', name: 'Default Workspace', type: 'PERSONAL', role: 'ADMIN' },
    memberships: [],
    selectWorkspace: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
  }),
}));

describe('Responsive Application Shell UI Components', () => {
  it('renders AppHeader with accessible brand link and status badge', () => {
    render(<AppHeader />);
    expect(screen.getByLabelText(/ApproveRail Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 2: Auth Active/i)).toBeInTheDocument();
  });

  it('renders DesktopSidebar with primary workflow navigation links', () => {
    render(<DesktopSidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Buy / Request')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
    expect(screen.getByText('Ledger')).toBeInTheDocument();
  });

  it('renders MobileBottomNav with exactly five mobile destinations', () => {
    render(<MobileBottomNav />);
    const nav = screen.getByRole('navigation', { name: /Mobile Bottom Navigation/i });
    expect(nav).toBeInTheDocument();

    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByLabelText('Buy')).toBeInTheDocument();
    expect(screen.getByLabelText('Activity')).toBeInTheDocument();
    expect(screen.getByLabelText('Policies')).toBeInTheDocument();
    expect(screen.getByLabelText('More')).toBeInTheDocument();
  });

  it('renders RoutePlaceholder with transparent phase labeling and security note', () => {
    render(
      <RoutePlaceholder
        title="Test Proposal Screen"
        routePath="/app/proposals/test-123"
        targetPhase="Phase 5: Proposal Review"
        description="Editable unsigned basket review"
        securityInvariantsNote="Human authorization bound to terms hash"
      />
    );

    expect(screen.getByText('Test Proposal Screen')).toBeInTheDocument();
    expect(screen.getByText('Phase 5: Proposal Review')).toBeInTheDocument();
    expect(screen.getByText(/Human authorization bound to terms hash/i)).toBeInTheDocument();
    expect(screen.getByText('Honest Greenfield Placeholder')).toBeInTheDocument();
  });
});

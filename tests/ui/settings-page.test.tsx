import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '@/app/app/settings/page';

vi.mock('@/ui/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    activeWorkspace: { id: 'ws-1', name: 'Acme Corp' },
  }),
}));

describe('Settings & Outbox UI Component', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string, opts?: any) => {
        if (url.includes('/notifications/settings') && opts?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              settings: {
                hasWebhookUrl: true,
                maskedWebhookUrl: 'https://hooks.zapier.com/hooks/.../***',
                enabled: true,
              },
            }),
          });
        }
        if (url.includes('/notifications/settings')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              settings: {
                hasWebhookUrl: true,
                maskedWebhookUrl: 'https://hooks.zapier.com/hooks/.../***',
                enabled: true,
                notifyProposalReady: true,
                notifyPolicyDenied: true,
                notifyPaymentCompleted: true,
                notifyPaymentFailed: true,
                notifyReconciliation: true,
              },
            }),
          });
        }
        if (url.includes('/notifications/history')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              history: [
                {
                  id: 'h-1',
                  eventType: 'TEST_NOTIFICATION',
                  status: 'DISPATCHED',
                  attempts: 1,
                  lastHttpStatus: 200,
                  summary: 'Synthetic test ping',
                  createdAt: '2026-10-25T12:00:00Z',
                },
              ],
            }),
          });
        }
        if (url.includes('/notifications/test')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              httpStatus: 200,
              deliveryStatus: 'DISPATCHED',
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      })
    );
  });

  it('renders settings page with webhook form and delivery history', async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Zapier Webhook Notification Outbox/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Delivery Log & Audit Trail/i)).toBeInTheDocument();
      expect(screen.getByText(/Active & Connected/i)).toBeInTheDocument();
      expect(screen.getByText(/TEST_NOTIFICATION/i)).toBeInTheDocument();
    });
  });

  it('handles sending test ping and shows feedback', async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Send Test Ping/i)).toBeInTheDocument();
    });

    const testBtn = screen.getByRole('button', { name: /Send Test Ping/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
    });
  });
});

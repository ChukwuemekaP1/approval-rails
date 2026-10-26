import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ShopPage from '@/app/app/shop/page';

vi.mock('@/ui/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    activeWorkspace: { id: 'ws-123', name: 'Test Workspace' },
  }),
}));

describe('Product Discovery & Refinement UI Journey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/basket')) {
        return Promise.resolve({ ok: true, json: async () => ({ totalItemsCount: 2 }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ products: [], total: 0, isLiveChannel3: true }),
      });
    });
  });

  it('triggers refinement card when user enters a broad search query', async () => {
    render(<ShopPage />);
    const input = screen.getByPlaceholderText(/Search any product/i);
    fireEvent.change(input, { target: { value: 'phone' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    expect(screen.getByText(/Refine "phone"/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Apple, Dell/i)).toBeInTheDocument();
  });

  it('allows user to provide optional brand and submit refined search', async () => {
    render(<ShopPage />);
    const input = screen.getByPlaceholderText(/Search any product/i);
    fireEvent.change(input, { target: { value: 'phone' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    const brandInput = screen.getByPlaceholderText(/e\.g\. Apple, Dell/i);
    fireEvent.change(brandInput, { target: { value: 'Apple' } });

    const searchBtn = screen.getByRole('button', { name: /Apply & Search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('q=phone+Apple'));
    });
  });

  it('allows skipping refinement to search directly', async () => {
    render(<ShopPage />);
    const input = screen.getByPlaceholderText(/Search any product/i);
    fireEvent.change(input, { target: { value: 'laptop' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    const skipBtn = screen.getByText(/Skip refinement/i);
    fireEvent.click(skipBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('q=laptop'));
    });
  });

  it('executes search directly for specific multi-spec queries', async () => {
    render(<ShopPage />);
    const input = screen.getByPlaceholderText(/Search any product/i);
    fireEvent.change(input, { target: { value: 'iPhone 16 Pro, 256 GB' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    expect(screen.queryByText(/Refine "iPhone 16 Pro/i)).not.toBeInTheDocument();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('q=iPhone+16+Pro%2C+256+GB'));
    });
  });

  it('renders honest error notice with retry button when search fails', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/basket')) return Promise.resolve({ ok: true, json: async () => ({}) });
      return Promise.resolve({
        ok: true,
        json: async () => ({ products: [], isLiveChannel3: false, error: 'Connection timeout' }),
      });
    });

    render(<ShopPage />);
    const input = screen.getByPlaceholderText(/Search any product/i);
    fireEvent.change(input, { target: { value: 'monitor' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    const skipBtn = screen.getByText(/Skip refinement/i);
    fireEvent.click(skipBtn);

    await waitFor(() => {
      expect(screen.getByText(/Connection timeout/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });
});

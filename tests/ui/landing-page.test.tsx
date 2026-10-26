import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HomePage from '@/app/page';

describe('Public Landing Page', () => {
  it('renders the core product tagline and brand mission', () => {
    render(<HomePage />);
    expect(screen.getAllByText(/AI proposes\. You authorize\./i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Every payment leaves proof\./i).length).toBeGreaterThan(0);
  });

  it('provides direct navigation calls to action for signup and login', () => {
    render(<HomePage />);
    const signupLinks = screen.getAllByRole('link', { name: /Create Account|Get Started/i });
    expect(signupLinks.length).toBeGreaterThan(0);
    expect(signupLinks[0]).toHaveAttribute('href', '/signup');

    const loginLinks = screen.getAllByRole('link', { name: /Log In|Sign In/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(loginLinks[0]).toHaveAttribute('href', '/login');
  });

  it('explains the 4-step procurement workflow', () => {
    render(<HomePage />);
    expect(screen.getByText(/AI Discovery & Requirement Refinement/i)).toBeInTheDocument();
    expect(screen.getByText(/Persistent Multi-Item Basket/i)).toBeInTheDocument();
    expect(screen.getByText(/Deterministic Spending Policies/i)).toBeInTheDocument();
    expect(screen.getByText(/Passkey Consent & Verified Settlement/i)).toBeInTheDocument();
  });

  it('differentiates personal and business workspace spheres', () => {
    render(<HomePage />);
    expect(screen.getByText(/Personal Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Business Organization/i)).toBeInTheDocument();
    expect(screen.getByText(/Non-Negotiable Security Invariants/i)).toBeInTheDocument();
  });
});

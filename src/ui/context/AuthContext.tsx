'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthPrincipal {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthWorkspace {
  id: string;
  name: string;
  type: 'PERSONAL' | 'BUSINESS';
  role?: 'ADMIN' | 'MEMBER';
}

export interface AuthMembership {
  workspace: AuthWorkspace;
  role: 'ADMIN' | 'MEMBER';
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  principal: AuthPrincipal | null;
  activeWorkspace: AuthWorkspace | null;
  memberships: AuthMembership[];
  refreshSession: () => Promise<void>;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [principal, setPrincipal] = useState<AuthPrincipal | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<AuthWorkspace | null>(null);
  const [memberships, setMemberships] = useState<AuthMembership[]>([]);
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/session', { cache: 'no-store' });
      if (!res.ok) {
        setIsAuthenticated(false);
        setPrincipal(null);
        setActiveWorkspace(null);
        setMemberships([]);
        return;
      }

      const data = await res.json();
      if (data.authenticated && data.principal) {
        setIsAuthenticated(true);
        setPrincipal(data.principal);
        setActiveWorkspace(data.activeWorkspace);
        setMemberships(data.memberships || []);
      } else {
        setIsAuthenticated(false);
        setPrincipal(null);
        setActiveWorkspace(null);
        setMemberships([]);
      }
    } catch {
      setIsAuthenticated(false);
      setPrincipal(null);
      setActiveWorkspace(null);
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const selectWorkspace = async (workspaceId: string) => {
    const res = await fetch('/api/v1/workspaces/select', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });

    if (res.ok) {
      const data = await res.json();
      setActiveWorkspace(data.activeWorkspace);
      await refreshSession();
    } else {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to select workspace');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      setIsAuthenticated(false);
      setPrincipal(null);
      setActiveWorkspace(null);
      setMemberships([]);
      router.push('/auth');
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        principal,
        activeWorkspace,
        memberships,
        refreshSession,
        selectWorkspace,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

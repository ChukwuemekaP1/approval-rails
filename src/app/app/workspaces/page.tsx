'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Shield,
  Users,
  Check,
  AlertCircle,
  Loader2,
  Building2,
  User,
} from 'lucide-react';
import { useAuth, AuthWorkspace } from '@/ui/context/AuthContext';

interface WorkspaceMemberItem {
  id: string;
  role: 'ADMIN' | 'MEMBER';
  principalId: string;
  email: string;
  displayName: string;
  joinedAt: string;
}

export default function WorkspacesPage() {
  const { isAuthenticated, isLoading: authLoading, activeWorkspace, selectWorkspace } = useAuth();

  const [workspaces, setWorkspaces] = useState<AuthWorkspace[]>([]);
  const [members, setMembers] = useState<WorkspaceMemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New workspace form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsType, setNewWsType] = useState<'PERSONAL' | 'BUSINESS'>('BUSINESS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWorkspacesAndMembers = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch workspaces
      const wsRes = await fetch('/api/v1/workspaces');
      if (wsRes.ok) {
        const data = await wsRes.json();
        setWorkspaces(data.workspaces || []);
      }

      // 2. Fetch members for active workspace if available
      if (activeWorkspace?.id) {
        const memRes = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/members`);
        if (memRes.ok) {
          const memData = await memRes.json();
          setMembers(memData.members || []);
        }
      }
    } catch {
      setErrorMsg('Failed to load workspace data');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspacesAndMembers();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchWorkspacesAndMembers]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWsName, type: newWsType }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to create workspace');
      }

      const created = await res.json();
      setNewWsName('');
      setShowCreateModal(false);

      // Select new workspace and refresh
      await selectWorkspace(created.workspace.id);
      await fetchWorkspacesAndMembers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Authentication Required
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Workspace tenancy and membership controls are strictly protected. Please sign in with your WebAuthn passkey to view or manage workspaces.
        </p>
        <div className="pt-2">
          <Link
            href="/auth"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow text-sm min-h-[44px]"
          >
            Sign In with Passkey &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Phase 2: Multi-Tenancy Active
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
            Workspaces & Membership
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Isolated multi-tenant boundaries enforced strictly at database queries
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[44px]"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Workspace
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Workspace List Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Your Workspaces ({workspaces.length})
        </h2>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
            Loading workspaces...
          </div>
        ) : workspaces.length === 0 ? (
          <div className="p-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center text-sm text-gray-500">
            No workspaces found. Click &quot;New Workspace&quot; to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => {
              const isActive = activeWorkspace?.id === ws.id;
              return (
                <div
                  key={ws.id}
                  className={`p-5 rounded-lg border bg-white dark:bg-gray-900 flex flex-col justify-between transition-all ${
                    isActive
                      ? 'border-sky-500 dark:border-sky-500 ring-2 ring-sky-500/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {ws.type === 'BUSINESS' ? (
                          <Building2 className="w-4 h-4 text-sky-600" />
                        ) : (
                          <User className="w-4 h-4 text-emerald-600" />
                        )}
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {ws.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ws.role}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                      {ws.name}
                    </h3>
                    <p className="text-[11px] font-mono text-gray-400 mt-1 truncate">
                      ID: {ws.id}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    {isActive ? (
                      <span className="inline-flex items-center text-xs font-semibold text-sky-600 dark:text-sky-400">
                        <Check className="w-4 h-4 mr-1" /> Active Workspace
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          await selectWorkspace(ws.id);
                          await fetchWorkspacesAndMembers();
                        }}
                        className="text-xs font-semibold text-gray-600 hover:text-sky-600 dark:text-gray-300 min-h-[36px]"
                      >
                        Switch to this Workspace &rarr;
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member Roster for Active Workspace */}
      {activeWorkspace && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                Active Workspace Members: {activeWorkspace.name}
              </h2>
              <p className="text-xs text-gray-500">
                Only authenticated principals with explicit memberships in this workspace can access resources.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {members.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 font-bold text-sm">
                      {m.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {m.displayName}
                      </p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        m.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {m.role}
                    </span>
                    <span className="text-[11px] text-gray-400 hidden sm:inline">
                      Joined {new Date(m.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Create New Workspace
            </h3>
            <p className="text-xs text-gray-500">
              You will automatically become the ADMIN of this workspace.
            </p>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. Acme Corp Operations"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus-visible:ring-2 focus-visible:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Workspace Type
                </label>
                <select
                  value={newWsType}
                  onChange={(e) => setNewWsType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  <option value="BUSINESS">Business (Multi-Member Organization)</option>
                  <option value="PERSONAL">Personal</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newWsName.trim()}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 min-h-[44px]"
                >
                  {isSubmitting ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

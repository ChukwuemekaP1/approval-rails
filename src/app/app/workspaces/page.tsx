'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth, AuthWorkspace } from '@/ui/context/AuthContext';
import { WorkspaceMembersSection } from '@/ui/components/workspace/WorkspaceMembersSection';
import { CreateWorkspaceModal } from '@/ui/components/workspace/CreateWorkspaceModal';
import { WorkspaceCardsList } from '@/ui/components/workspace/WorkspaceCardsList';

export default function WorkspacesPage() {
  const { isAuthenticated, isLoading: authLoading, activeWorkspace, selectWorkspace } = useAuth();
  const [workspaces, setWorkspaces] = useState<AuthWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsType, setNewWsType] = useState<'PERSONAL' | 'BUSINESS'>('BUSINESS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/workspaces');
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      }
    } catch {
      setErrorMsg('Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchWorkspaces();
    else setIsLoading(false);
  }, [isAuthenticated, fetchWorkspaces]);

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
      if (!res.ok) throw new Error('Failed to create workspace');
      const created = await res.json();
      setNewWsName('');
      setShowCreateModal(false);
      await selectWorkspace(created.workspace.id);
      await fetchWorkspaces();
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
      <div className="max-w-md mx-auto p-8 rounded-xl border border-gray-200 text-center space-y-3">
        <Shield className="w-8 h-8 text-sky-600 mx-auto" />
        <h1 className="text-xl font-bold">Authentication Required</h1>
        <p className="text-xs text-gray-500">Please sign in to view workspaces.</p>
        <Link href="/login" className="inline-block px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">Workspaces & Membership</h1>
          <p className="text-xs text-gray-500">Multi-tenant boundary management</p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 min-h-[44px]"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Workspace
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Your Workspaces ({workspaces.length})</h2>
        <WorkspaceCardsList
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspace?.id}
          onSelect={async (id) => {
            await selectWorkspace(id);
            await fetchWorkspaces();
          }}
          isLoading={isLoading}
        />
      </div>

      {activeWorkspace && <WorkspaceMembersSection workspaceId={activeWorkspace.id} />}

      <CreateWorkspaceModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateWorkspace}
        name={newWsName}
        setName={setNewWsName}
        type={newWsType}
        setType={setNewWsType}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

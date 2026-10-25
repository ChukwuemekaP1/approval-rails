'use client';

import React from 'react';
import { Building2, User, Check, Loader2 } from 'lucide-react';
import { AuthWorkspace } from '@/ui/context/AuthContext';

interface Props {
  workspaces: AuthWorkspace[];
  activeWorkspaceId?: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export function WorkspaceCardsList({ workspaces, activeWorkspaceId, onSelect, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
        Loading workspaces...
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center text-sm text-gray-500">
        No workspaces found. Click &quot;New Workspace&quot; to create one.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workspaces.map((ws) => {
        const isActive = activeWorkspaceId === ws.id;
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
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {ws.type}
                  </span>
                </div>
                {isActive && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                    <Check className="w-3.5 h-3.5" /> Active
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">{ws.name}</h3>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              {isActive ? (
                <span className="text-xs text-emerald-600 font-medium">Currently Selected</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect(ws.id)}
                  className="text-xs font-semibold text-gray-600 hover:text-sky-600 dark:text-gray-300"
                >
                  Switch to this Workspace &rarr;
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

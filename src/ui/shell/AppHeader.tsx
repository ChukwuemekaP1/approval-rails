'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Layers, LogOut, User, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AppHeader() {
  const { isAuthenticated, principal, activeWorkspace, memberships, selectWorkspace, logout } = useAuth();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Link
          href="/app"
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-sky-500 rounded p-1"
          aria-label="ApproveRail Home"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-base tracking-tight font-extrabold text-sky-900 dark:text-sky-300">
            Approve<span className="text-sky-600 dark:text-sky-400">Rail</span>
          </span>
        </Link>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Protected by Passkey
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <div className="relative">
              <button
                type="button"
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[36px]"
                aria-label={`Current Workspace: ${activeWorkspace?.name || 'Select Workspace'}`}
                aria-expanded={workspaceMenuOpen}
              >
                <Layers className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                <span className="truncate max-w-[120px] sm:max-w-[160px]">
                  {activeWorkspace?.name || 'No Workspace'}
                </span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {workspaceMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-1 z-50 focus:outline-none"
                  role="menu"
                >
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    Switch Workspace
                  </div>
                  {memberships.map((m) => {
                    const isSelected = activeWorkspace?.id === m.workspace.id;
                    return (
                      <button
                        key={m.workspace.id}
                        type="button"
                        onClick={async () => {
                          await selectWorkspace(m.workspace.id);
                          setWorkspaceMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          isSelected ? 'font-semibold text-sky-600 dark:text-sky-400' : 'text-gray-700 dark:text-gray-300'
                        }`}
                        role="menuitem"
                      >
                        <div className="flex flex-col">
                          <span className="truncate">{m.workspace.name}</span>
                          <span className="text-[10px] text-gray-400">Role: {m.role}</span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-sky-600" />}
                      </button>
                    );
                  })}
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                    <Link
                      href="/app/workspaces"
                      onClick={() => setWorkspaceMenuOpen(false)}
                      className="block px-3 py-2 text-xs text-sky-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Manage All Workspaces &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
              <User className="h-3.5 w-3.5" />
              <span className="max-w-[100px] truncate">{principal?.displayName}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center text-xs font-semibold px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[36px]"
              aria-label="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-white focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[36px]"
          >
            Sign In with Passkey
          </Link>
        )}
      </div>
    </header>
  );
}

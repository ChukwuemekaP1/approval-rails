'use client';

import React from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  name: string;
  setName: (val: string) => void;
  type: 'PERSONAL' | 'BUSINESS';
  setType: (val: 'PERSONAL' | 'BUSINESS') => void;
  isSubmitting: boolean;
}

export function CreateWorkspaceModal(props: Props) {
  const { show, onClose, onSubmit, name, setName, type, setType, isSubmitting } = props;
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-md w-full p-6 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Workspace</h3>
        <p className="text-xs text-gray-500">You will automatically become the OWNER of this workspace.</p>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Engineering Team, Acme Corp"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus-visible:ring-2 focus-visible:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Workspace Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <option value="BUSINESS">Business (Multi-Member Organization)</option>
              <option value="PERSONAL">Personal</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 min-h-[44px]"
            >
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

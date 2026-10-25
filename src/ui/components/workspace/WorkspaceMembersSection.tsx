'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Copy, Check } from 'lucide-react';

interface Props {
  workspaceId: string;
}

export function WorkspaceMembersSection({ workspaceId }: Props) {
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MANAGER' | 'PURCHASER'>('PURCHASER');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {}
  }, [workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setGeneratedLink(null);
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedLink(data.inviteUrl);
        setInviteEmail('');
        loadData();
      }
    } finally {
      setIsInviting(false);
    }
  };

  const copyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-600" /> Team Members & Roles
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Invite business managers to approve or purchasers to submit requests.
        </p>
      </div>

      <form onSubmit={handleInvite} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <option value="PURCHASER">Purchaser (Searches & Submits)</option>
            <option value="MANAGER">Manager (Approves Purchases)</option>
          </select>
          <button
            type="submit"
            disabled={isInviting}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shrink-0 disabled:opacity-50"
          >
            {isInviting ? 'Inviting...' : 'Invite'}
          </button>
        </div>

        {generatedLink && (
          <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-xs flex items-center justify-between gap-2">
            <span className="truncate font-mono text-[11px] text-teal-800 dark:text-teal-300">
              {generatedLink}
            </span>
            <button
              type="button"
              onClick={copyLink}
              className="py-1 px-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-medium flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </form>

      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.id}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">{m.displayName}</span>
              <span className="text-slate-400 ml-2 text-[11px]">{m.email}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/ui/context/AuthContext';
import { BusinessDashboardView } from '@/ui/components/dashboard/BusinessDashboardView';
import { PersonalDashboardView } from '@/ui/components/dashboard/PersonalDashboardView';
import { Loader2, ArrowLeftRight } from 'lucide-react';

export default function DashboardPage() {
  const { isLoading, activeWorkspace } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !activeWorkspace) {
      router.push('/onboarding');
    }
  }, [isLoading, activeWorkspace, router]);

  if (isLoading || !activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-7 h-7 text-teal-600 animate-spin" />
        <p className="text-xs text-gray-500">Loading your workspace...</p>
      </div>
    );
  }

  const isBusiness = activeWorkspace.type === 'BUSINESS';

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Active Sphere:</span>
          <span
            className={`px-2 py-0.5 rounded font-bold ${
              isBusiness
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            {isBusiness ? 'Business Organization' : 'Personal Workspace'}
          </span>
        </div>
        <Link
          href="/app/workspaces"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Switch Workspace</span>
        </Link>
      </div>

      {isBusiness ? (
        <BusinessDashboardView workspace={activeWorkspace} />
      ) : (
        <PersonalDashboardView workspace={activeWorkspace} />
      )}
    </div>
  );
}

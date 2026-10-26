'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/ui/context/AuthContext';
import { AppHeader } from './AppHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Loader2 } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading, activeWorkspace } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!activeWorkspace) {
        router.push('/onboarding');
      }
    }
  }, [isAuthenticated, isLoading, activeWorkspace, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-gray-950 text-gray-500">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-2" />
        <p className="text-xs">Authenticating workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <AppHeader />
      <div className="flex-1 flex w-full">
        <DesktopSidebar />
        <main
          id="main-content"
          className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto focus:outline-none"
        >
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

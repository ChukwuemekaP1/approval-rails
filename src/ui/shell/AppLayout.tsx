'use client';

import React from 'react';
import { AppHeader } from './AppHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
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

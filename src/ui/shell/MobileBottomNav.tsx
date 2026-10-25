'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, Clock, FileCheck2, MoreHorizontal } from 'lucide-react';

interface MobileDestination {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

const DESTINATIONS: MobileDestination[] = [
  { name: 'Home', href: '/app', icon: Home },
  { name: 'Shop', href: '/app/shop', icon: Store },
  { name: 'Activity', href: '/app/transactions', icon: Clock },
  { name: 'Policies', href: '/app/policies', icon: FileCheck2 },
  { name: 'More', href: '/app/settings', icon: MoreHorizontal },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isCurrent = (href: string) => {
    if (href === '/app') {
      return pathname === '/app';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 safe-bottom"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-16 w-full max-w-full">
        {DESTINATIONS.map((item) => {
          const active = isCurrent(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1 transition-colors min-h-[48px] focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm ${
                active
                  ? 'text-sky-600 dark:text-sky-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={item.name}
            >
              <item.icon className="h-5 w-5 mb-0.5" aria-hidden="true" />
              <span className="text-[11px] tracking-tight leading-none truncate max-w-full">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

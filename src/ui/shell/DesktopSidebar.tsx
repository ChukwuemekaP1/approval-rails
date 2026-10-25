'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ShoppingCart,
  FileCheck2,
  Clock,
  ShieldCheck,
  Layers,
  ScrollText,
  FileSearch,
  Settings,
  FlaskConical,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  phaseBadge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { name: 'Dashboard', href: '/app', icon: Home },
  { name: 'Buy / Request', href: '/app/purchases/new', icon: ShoppingCart },
  { name: 'Proposals', href: '/app/proposals', icon: ShieldCheck },
  { name: 'Activity', href: '/app/transactions', icon: Clock },
  { name: 'Policies', href: '/app/policies', icon: FileCheck2 },
  { name: 'Ledger', href: '/app/ledger', icon: ScrollText },
];

const SECONDARY_NAV: NavItem[] = [
  { name: 'Workspaces', href: '/app/workspaces', icon: Layers },
  { name: 'Verify Evidence', href: '/app/verify', icon: FileSearch },
  { name: 'Settings', href: '/app/settings', icon: Settings },
  { name: 'Adversarial Lab', href: '/app/lab', icon: FlaskConical, phaseBadge: 'Demo' },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  const isCurrent = (href: string) => {
    if (href === '/app') {
      return pathname === '/app';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="hidden md:flex md:w-60 md:flex-col md:inset-y-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      aria-label="Desktop Sidebar Navigation"
    >
      <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
        <div className="px-4 mb-3">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Core Workflow
          </p>
        </div>
        <nav className="flex-1 px-3 space-y-1" aria-label="Main Navigation">
          {PRIMARY_NAV.map((item) => {
            const active = isCurrent(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors min-h-[40px] ${
                  active
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-4 w-4 ${
                    active ? 'text-sky-600 dark:text-sky-400' : 'text-gray-400 dark:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800 px-1">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Operations & Security
            </p>
            <div className="space-y-1">
              {SECONDARY_NAV.map((item) => {
                const active = isCurrent(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors min-h-[40px] ${
                      active
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <div className="flex items-center min-w-0">
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-4 w-4 ${
                          active ? 'text-sky-600 dark:text-sky-400' : 'text-gray-400 dark:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.phaseBadge && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {item.phaseBadge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Security Invariants</span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">15 Locked</span>
        </div>
        <p className="text-[11px] leading-tight text-gray-400 dark:text-gray-500">
          AI isolated • Deterministic policy • Passkey consent
        </p>
      </div>
    </aside>
  );
}

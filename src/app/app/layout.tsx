import React from 'react';
import { AppLayout } from '@/ui/shell/AppLayout';

export default function AppRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}

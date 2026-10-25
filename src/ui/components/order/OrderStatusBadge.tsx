'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';
import { PaymentStatus } from '@/domain/payment/types';

interface OrderStatusBadgeProps {
  status: PaymentStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Captured & Completed
        </span>
      );
    case 'APPROVAL_PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300">
          <Clock className="w-3.5 h-3.5 text-sky-500" />
          Awaiting PayPal Approval
        </span>
      );
    case 'CAPTURE_PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          Capture In Progress
        </span>
      );
    case 'UNKNOWN':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
          <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
          Ambiguous State (Reconciliation Required)
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          Payment Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5" />
          {status}
        </span>
      );
  }
}

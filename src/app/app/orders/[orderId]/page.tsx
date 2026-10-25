'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { useOrderDetail } from '@/ui/hooks/use-order-detail';
import { OrderStatusBadge } from '@/ui/components/order/OrderStatusBadge';
import { OrderActions } from '@/ui/components/order/OrderActions';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    order,
    isLoading,
    isCapturing,
    isReconciling,
    errorMsg,
    handleCapture,
    handleReconcile,
  } = useOrderDetail(orderId, isAuthenticated);

  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs text-gray-500">Loading order settlement status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
        <Lock className="w-10 h-10 text-sky-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Authentication Required</h2>
        <p className="text-xs text-gray-500 mt-1">Sign in to view order details.</p>
        <Link href="/auth" className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-sky-600 text-white font-medium text-xs rounded-lg">
          Sign In with Passkey <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">{errorMsg || 'Order does not exist in this workspace.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <span className="text-[11px] font-semibold text-gray-400">Order ID: {order.id.slice(0, 8)}...</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
            PayPal Settlement
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Authoritative Orders v2 Capture & Lifecycle</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[11px] text-gray-400">Merchant</span>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{order.merchant}</p>
          </div>
          <div>
            <span className="text-[11px] text-gray-400">Total Settled</span>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{order.currency} {order.amount}</p>
          </div>
          <div>
            <span className="text-[11px] text-gray-400">PayPal Reference</span>
            <p className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate">{order.paypalOrderId}</p>
          </div>
        </div>

        <OrderActions
          order={order}
          isCapturing={isCapturing}
          isReconciling={isReconciling}
          onCapture={handleCapture}
          onReconcile={handleReconcile}
        />
      </div>
    </div>
  );
}

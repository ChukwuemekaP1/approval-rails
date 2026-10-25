'use client';

import React from 'react';
import { ExternalLink, CreditCard, RefreshCw, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { OrderDTO } from '@/application/payment/order-dto';

interface OrderActionsProps {
  order: OrderDTO;
  isCapturing: boolean;
  isReconciling: boolean;
  onCapture: () => void;
  onReconcile: () => void;
}

export function OrderActions({
  order,
  isCapturing,
  isReconciling,
  onCapture,
  onReconcile,
}: OrderActionsProps) {
  const isApprovedOrPending = order.status === 'APPROVAL_PENDING';
  const isAmbiguous = order.status === 'UNKNOWN' || order.status === 'CAPTURE_PENDING';

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>No card or banking details are collected or stored on this server.</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {isApprovedOrPending && order.approvalUrl && (
          <a
            href={order.approvalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <span>Proceed to PayPal Sandbox Checkout</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {isApprovedOrPending && (
          <button
            onClick={onCapture}
            disabled={isCapturing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            {isCapturing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Capturing Payment...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Capture Approved Payment</span>
              </>
            )}
          </button>
        )}

        {isAmbiguous && (
          <button
            onClick={onReconcile}
            disabled={isReconciling}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            {isReconciling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking PayPal State...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Reconcile with PayPal</span>
              </>
            )}
          </button>
        )}
      </div>

      {order.status === 'UNKNOWN' && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Payment response timed out. Click Reconcile to verify authoritative PayPal capture status.
          </span>
        </div>
      )}
    </div>
  );
}

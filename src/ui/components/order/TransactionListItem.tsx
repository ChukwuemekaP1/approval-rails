'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { OrderDTO } from '@/application/payment/order-dto';
import { OrderStatusBadge } from './OrderStatusBadge';

interface TransactionListItemProps {
  order: OrderDTO;
}

export function TransactionListItem({ order }: TransactionListItemProps) {
  return (
    <Link
      href={`/app/transactions/${order.id}`}
      className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-sky-500 rounded-xl shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900 dark:text-white">{order.merchant}</span>
          <span className="text-[11px] text-gray-400 font-mono">ID: {order.id.slice(0, 8)}...</span>
        </div>
        <div className="text-xs text-gray-500">
          Amount: <span className="font-extrabold text-gray-900 dark:text-white">{order.currency} {order.amount}</span>
        </div>
        <div className="text-[10px] text-gray-400">
          Created {new Date(order.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <OrderStatusBadge status={order.status} />
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </Link>
  );
}

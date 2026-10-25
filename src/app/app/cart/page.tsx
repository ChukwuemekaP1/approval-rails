'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { CartLineItem } from '@/ui/components/cart/CartLineItem';
import { CartSummary } from '@/ui/components/cart/CartSummary';
import { CartEmptyState } from '@/ui/components/cart/CartEmptyState';

export default function CartPage() {
  const router = useRouter();
  const { activeWorkspace } = useAuth();
  const [basket, setBasket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcuring, setIsProcuring] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadBasket = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/basket`);
      if (res.ok) setBasket(await res.json());
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading basket');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    loadBasket();
  }, [loadBasket]);

  const handleToggleSelect = async (itemId: string, selected: boolean) => {
    if (!activeWorkspace?.id) return;
    await fetch(`/api/v1/workspaces/${activeWorkspace.id}/basket/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected }),
    });
    loadBasket();
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (!activeWorkspace?.id) return;
    await fetch(`/api/v1/workspaces/${activeWorkspace.id}/basket/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    loadBasket();
  };

  const handleRemove = async (itemId: string) => {
    if (!activeWorkspace?.id) return;
    await fetch(`/api/v1/workspaces/${activeWorkspace.id}/basket/items/${itemId}`, {
      method: 'DELETE',
    });
    loadBasket();
  };

  const handleProcure = async (selectAllFirst = false) => {
    if (!activeWorkspace?.id) return;
    setIsProcuring(true);
    setErrorMsg(null);
    try {
      if (selectAllFirst && basket?.items) {
        await Promise.all(
          basket.items.map((i: any) =>
            fetch(`/api/v1/workspaces/${activeWorkspace.id}/basket/items/${i.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ selected: true }),
            })
          )
        );
      }

      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/basket/procure`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.title || 'Procurement failed');

      router.push(`/app/proposals/${data.proposal.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Procurement error');
      setIsProcuring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
        <span className="text-xs">Loading persistent basket...</span>
      </div>
    );
  }

  const items = basket?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/app/shop"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Procurement Basket</h1>
          <p className="text-xs text-slate-500">Persistent multi-search basket for {activeWorkspace?.name}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {items.length === 0 ? (
        <CartEmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item: any) => (
              <CartLineItem
                key={item.id}
                item={item}
                onToggleSelect={handleToggleSelect}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <div>
            <CartSummary
              selectedCount={basket.selectedCount || 0}
              totalCount={basket.totalItemsCount || 0}
              selectedSubtotal={basket.formattedSelectedSubtotal || '$0.00'}
              totalBasket={basket.formattedTotalBasket || '$0.00'}
              onProcureSelected={() => handleProcure(false)}
              onProcureAll={() => handleProcure(true)}
              isProcuring={isProcuring}
            />
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { OrderDTO } from '@/application/payment/order-dto';

export function useOrderDetail(orderId: string, isAuthenticated: boolean) {
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to load order');
      }
      const data = await res.json();
      setOrder(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isAuthenticated && orderId) fetchOrder();
    else setIsLoading(false);
  }, [isAuthenticated, orderId, fetchOrder]);

  const handleCapture = async () => {
    if (!orderId) return;
    setIsCapturing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/capture`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Capture failed');
      setOrder(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error capturing order');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleReconcile = async () => {
    if (!orderId) return;
    setIsReconciling(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/reconcile`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Reconciliation failed');
      setOrder(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error reconciling order');
    } finally {
      setIsReconciling(false);
    }
  };

  return {
    order,
    isLoading,
    isCapturing,
    isReconciling,
    errorMsg,
    handleCapture,
    handleReconcile,
  };
}

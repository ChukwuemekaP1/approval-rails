'use client';

import { useState, useEffect, useCallback } from 'react';
import { PurchaseRequestDTO } from '@/application/purchase/purchase-use-cases';

export function usePurchaseRequest(workspaceId?: string, requestId?: string, isAuthenticated?: boolean) {
  const [request, setRequest] = useState<PurchaseRequestDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    if (!workspaceId || !requestId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/purchases/${requestId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to load purchase request');
      }
      const data = await res.json();
      setRequest(data.request);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading purchase request');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, requestId]);

  useEffect(() => {
    if (isAuthenticated && workspaceId && requestId) {
      fetchRequest();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, workspaceId, requestId, fetchRequest]);

  const retryResearch = async () => {
    if (!workspaceId || !requestId) return;
    setIsRetrying(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/purchases/${requestId}/research`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Research retry failed');
      }
      const data = await res.json();
      setRequest(data.request);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error retrying research');
    } finally {
      setIsRetrying(false);
    }
  };

  return { request, isLoading, isRetrying, errorMsg, setErrorMsg, retryResearch };
}

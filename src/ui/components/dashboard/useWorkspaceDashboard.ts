'use client';

import { useState, useEffect, useCallback } from 'react';
import { FormattedPolicyDTO } from '@/application/policy/policy-use-cases';

export interface DashboardMetrics {
  policy: FormattedPolicyDTO | null;
  basketCount: number;
  proposalsCount: number;
  approvalsCount: number;
  membersCount: number;
  isLoading: boolean;
}

export function useWorkspaceDashboard(workspaceId?: string, isBusiness: boolean = false): DashboardMetrics {
  const [policy, setPolicy] = useState<FormattedPolicyDTO | null>(null);
  const [basketCount, setBasketCount] = useState(0);
  const [proposalsCount, setProposalsCount] = useState(0);
  const [approvalsCount, setApprovalsCount] = useState(0);
  const [membersCount, setMembersCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);

    try {
      const [policyRes, basketRes, propRes] = await Promise.all([
        fetch(`/api/v1/workspaces/${workspaceId}/policy`).catch(() => null),
        fetch(`/api/v1/workspaces/${workspaceId}/basket`).catch(() => null),
        fetch(`/api/v1/workspaces/${workspaceId}/proposals`).catch(() => null),
      ]);

      if (policyRes?.ok) {
        const pData = await policyRes.json();
        setPolicy(pData.policy || null);
      }

      if (basketRes?.ok) {
        const bData = await basketRes.json();
        setBasketCount(bData.totalItemsCount || 0);
      }

      if (propRes?.ok) {
        const prData = await propRes.json();
        setProposalsCount((prData.proposals || []).length);
      }

      if (isBusiness) {
        const [appRes, memRes] = await Promise.all([
          fetch(`/api/v1/workspaces/${workspaceId}/approvals`).catch(() => null),
          fetch(`/api/v1/workspaces/${workspaceId}/members`).catch(() => null),
        ]);

        if (appRes?.ok) {
          const aData = await appRes.json();
          setApprovalsCount((aData.approvals || []).length);
        }

        if (memRes?.ok) {
          const mData = await memRes.json();
          setMembersCount((mData.members || []).length);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, isBusiness]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { policy, basketCount, proposalsCount, approvalsCount, membersCount, isLoading };
}

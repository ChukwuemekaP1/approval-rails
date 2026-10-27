'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FormattedPolicyDTO } from '@/ui/components/policies/types';
import { validatePolicyInputs } from './policyValidation';
import { usePolicyFormState } from './usePolicyFormState';

export function useWorkspacePolicy(workspaceId?: string, isAuthenticated?: boolean, isAdmin?: boolean) {
  const [activePolicy, setActivePolicy] = useState<FormattedPolicyDTO | null>(null);
  const [versions, setVersions] = useState<FormattedPolicyDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const { populateFromPolicy, ...form } = usePolicyFormState();

  const fetchPolicyData = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const pRes = await fetch(`/api/v1/workspaces/${workspaceId}/policy`);
      if (pRes.ok) {
        const pData = await pRes.json();
        const pol = pData.policy as FormattedPolicyDTO;
        setActivePolicy(pol);
        populateFromPolicy(pol);
      } else {
        const err = await pRes.json();
        setErrorMsg(err.detail || 'Failed to load policy');
      }

      const vRes = await fetch(`/api/v1/workspaces/${workspaceId}/policy/versions`);
      if (vRes.ok) {
        const vData = await vRes.json();
        setVersions(vData.versions || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading policy data');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, populateFromPolicy]);

  useEffect(() => {
    if (isAuthenticated && workspaceId) {
      fetchPolicyData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, workspaceId, fetchPolicyData]);

  const isDirty = useMemo(() => {
    if (!activePolicy) return false;
    return (
      form.formName !== activePolicy.name ||
      form.formCurrency !== activePolicy.currency ||
      form.formMaxTx !== activePolicy.maxTransactionAmount ||
      form.formMonthlyCap !== activePolicy.monthlyBudgetCap ||
      form.formRequireAdminAbove !== (activePolicy.requireAdminAbove || '') ||
      form.formAllowedCategories !== (activePolicy.allowedCategories ? activePolicy.allowedCategories.join(', ') : '') ||
      form.formBlockedMerchants !== (activePolicy.blockedMerchants ? activePolicy.blockedMerchants.join(', ') : '')
    );
  }, [activePolicy, form]);

  const validationErrors = useMemo(() => {
    return validatePolicyInputs(form.formMaxTx, form.formMonthlyCap, form.formRequireAdminAbove);
  }, [form.formMaxTx, form.formMonthlyCap, form.formRequireAdminAbove]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleResetForm = () => {
    if (activePolicy) populateFromPolicy(activePolicy);
    setErrorMsg(null);
  };

  const handleSavePolicy = async (e: React.FormEvent, onSuccess: () => void) => {
    e.preventDefault();
    if (!workspaceId || !isAdmin || validationErrors.length > 0) return;
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const allowedCats = form.formAllowedCategories.split(',').map((s) => s.trim()).filter(Boolean);
      const blockedMerchs = form.formBlockedMerchants.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/policy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.formName.trim(),
          currency: form.formCurrency,
          maxTransactionAmount: form.formMaxTx.trim(),
          monthlyBudgetCap: form.formMonthlyCap.trim(),
          requireAdminAbove: form.formRequireAdminAbove.trim() ? form.formRequireAdminAbove.trim() : null,
          allowedCategories: allowedCats.length > 0 ? allowedCats : null,
          blockedMerchants: blockedMerchs.length > 0 ? blockedMerchs : null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to publish policy version');
      }
      const data = await res.json();
      setSuccessMsg(`Successfully activated Version ${data.policy.version}!`);
      await fetchPolicyData();
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error publishing policy version');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    activePolicy, versions, isLoading, isSaving, errorMsg, successMsg, copiedHash, isDirty,
    validationErrors, ...form, handleCopyHash, handleResetForm, handleSavePolicy,
  };
}

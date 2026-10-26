'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/ui/context/AuthContext';
import { CurrencyCode } from '@/domain/money/currency';
import { OnboardingStepSphere } from '@/ui/components/onboarding/OnboardingStepSphere';
import { OnboardingStepLimits } from '@/ui/components/onboarding/OnboardingStepLimits';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, activeWorkspace, principal, refreshSession } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [workspaceType, setWorkspaceType] = useState<'PERSONAL' | 'BUSINESS'>('PERSONAL');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [maxTx, setMaxTx] = useState('1000.00');
  const [monthlyCap, setMonthlyCap] = useState('5000.00');
  const [managerEmail, setManagerEmail] = useState('');
  const [requireAdminAbove, setRequireAdminAbove] = useState('500.00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (activeWorkspace?.name) {
      setName(activeWorkspace.name);
      setWorkspaceType(activeWorkspace.type);
    } else if (principal?.displayName) {
      setName(`${principal.displayName}'s Workspace`);
    }
  }, [activeWorkspace, principal]);

  const handleSelectSphere = (type: 'PERSONAL' | 'BUSINESS') => {
    setWorkspaceType(type);
    if (type === 'BUSINESS') {
      setMaxTx('10000.00');
      setMonthlyCap('50000.00');
      setName(name.includes('Personal') ? 'Acme Tech Inc' : name);
    } else {
      setMaxTx('1000.00');
      setMonthlyCap('5000.00');
      setName(principal?.displayName ? `${principal.displayName}'s Purchases` : 'Personal Purchases');
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceType,
          workspaceName: name.trim(),
          currency,
          maxTransactionAmount: maxTx,
          monthlyBudgetCap: monthlyCap,
          managerEmail: workspaceType === 'BUSINESS' ? managerEmail : null,
          requireAdminAbove: workspaceType === 'BUSINESS' ? requireAdminAbove : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.title || 'Failed to complete setup');

      await refreshSession();
      router.push(data.redirectTo || '/app');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Onboarding error');
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs text-slate-500">Checking your account session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-md">
            AR
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white">ApproveRail Onboarding</span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 rounded-3xl sm:px-10">
          {step === 1 ? (
            <OnboardingStepSphere
              workspaceType={workspaceType}
              onSelect={handleSelectSphere}
              onNext={() => setStep(2)}
            />
          ) : (
            <OnboardingStepLimits
              workspaceType={workspaceType}
              name={name}
              setName={setName}
              currency={currency}
              setCurrency={setCurrency}
              maxTx={maxTx}
              setMaxTx={setMaxTx}
              monthlyCap={monthlyCap}
              setMonthlyCap={setMonthlyCap}
              managerEmail={managerEmail}
              setManagerEmail={setManagerEmail}
              requireAdminAbove={requireAdminAbove}
              setRequireAdminAbove={setRequireAdminAbove}
              isLoading={isSubmitting}
              onBack={() => setStep(1)}
              onSubmit={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Shield,
  History,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  Building2,
  DollarSign,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/domain/money/currency';

interface FormattedPolicyDTO {
  id: string;
  workspaceId: string;
  version: number;
  name: string;
  currency: CurrencyCode;
  maxTransactionAmount: string;
  maxTransactionAmountMinor: string;
  monthlyBudgetCap: string;
  monthlyBudgetCapMinor: string;
  requireAdminAbove: string | null;
  requireAdminAboveMinor: string | null;
  allowedCategories: string[] | null;
  blockedMerchants: string[] | null;
  canonicalContent: string;
  contentHash: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export default function PoliciesPage() {
  const { isAuthenticated, isLoading: authLoading, activeWorkspace } = useAuth();

  const [activePolicy, setActivePolicy] = useState<FormattedPolicyDTO | null>(null);
  const [versions, setVersions] = useState<FormattedPolicyDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'editor' | 'history'>('overview');
  const [selectedInspectVersion, setSelectedInspectVersion] = useState<FormattedPolicyDTO | null>(null);

  // Policy Form State
  const [formName, setFormName] = useState('Default Spending Policy');
  const [formCurrency, setFormCurrency] = useState<CurrencyCode>('USD');
  const [formMaxTx, setFormMaxTx] = useState('250.00');
  const [formMonthlyCap, setFormMonthlyCap] = useState('1000.00');
  const [formRequireAdminAbove, setFormRequireAdminAbove] = useState('');
  const [formAllowedCategories, setFormAllowedCategories] = useState('');
  const [formBlockedMerchants, setFormBlockedMerchants] = useState('');

  const isAdmin = activeWorkspace?.role === 'ADMIN';

  const fetchPolicyData = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch active policy
      const policyRes = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/policy`);
      if (policyRes.ok) {
        const policyData = await policyRes.json();
        const pol = policyData.policy as FormattedPolicyDTO;
        setActivePolicy(pol);

        // Populate editor form with active policy
        setFormName(pol.name);
        setFormCurrency(pol.currency);
        setFormMaxTx(pol.maxTransactionAmount);
        setFormMonthlyCap(pol.monthlyBudgetCap);
        setFormRequireAdminAbove(pol.requireAdminAbove || '');
        setFormAllowedCategories(pol.allowedCategories ? pol.allowedCategories.join(', ') : '');
        setFormBlockedMerchants(pol.blockedMerchants ? pol.blockedMerchants.join(', ') : '');
      } else {
        const err = await policyRes.json();
        setErrorMsg(err.detail || 'Failed to load policy');
      }

      // 2. Fetch version history
      const versionsRes = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/policy/versions`);
      if (versionsRes.ok) {
        const versionsData = await versionsRes.json();
        setVersions(versionsData.versions || []);
      }
    } catch {
      setErrorMsg('Failed to connect to policy service');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (isAuthenticated && activeWorkspace?.id) {
      fetchPolicyData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeWorkspace?.id, fetchPolicyData]);

  // Compute dirty state
  const isDirty = useMemo(() => {
    if (!activePolicy) return false;
    if (formName !== activePolicy.name) return true;
    if (formCurrency !== activePolicy.currency) return true;
    if (formMaxTx !== activePolicy.maxTransactionAmount) return true;
    if (formMonthlyCap !== activePolicy.monthlyBudgetCap) return true;
    if ((formRequireAdminAbove || null) !== (activePolicy.requireAdminAbove || null)) return true;

    const currentAllowed = activePolicy.allowedCategories ? activePolicy.allowedCategories.join(', ') : '';
    if (formAllowedCategories.trim() !== currentAllowed) return true;

    const currentBlocked = activePolicy.blockedMerchants ? activePolicy.blockedMerchants.join(', ') : '';
    if (formBlockedMerchants.trim() !== currentBlocked) return true;

    return false;
  }, [
    activePolicy,
    formName,
    formCurrency,
    formMaxTx,
    formMonthlyCap,
    formRequireAdminAbove,
    formAllowedCategories,
    formBlockedMerchants,
  ]);

  // Form validations
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    const maxTxNum = parseFloat(formMaxTx);
    const monthlyCapNum = parseFloat(formMonthlyCap);

    if (isNaN(maxTxNum) || maxTxNum <= 0) {
      errors.push('Per-transaction cap must be a positive number');
    }
    if (isNaN(monthlyCapNum) || monthlyCapNum <= 0) {
      errors.push('Monthly budget cap must be a positive number');
    }
    if (!isNaN(maxTxNum) && !isNaN(monthlyCapNum) && maxTxNum > monthlyCapNum) {
      errors.push('Per-transaction cap cannot exceed the monthly budget cap');
    }
    if (formRequireAdminAbove) {
      const adminThresh = parseFloat(formRequireAdminAbove);
      if (isNaN(adminThresh) || adminThresh <= 0) {
        errors.push('Admin approval threshold must be a positive number');
      }
    }
    return errors;
  }, [formMaxTx, formMonthlyCap, formRequireAdminAbove]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleResetForm = () => {
    if (!activePolicy) return;
    setFormName(activePolicy.name);
    setFormCurrency(activePolicy.currency);
    setFormMaxTx(activePolicy.maxTransactionAmount);
    setFormMonthlyCap(activePolicy.monthlyBudgetCap);
    setFormRequireAdminAbove(activePolicy.requireAdminAbove || '');
    setFormAllowedCategories(activePolicy.allowedCategories ? activePolicy.allowedCategories.join(', ') : '');
    setFormBlockedMerchants(activePolicy.blockedMerchants ? activePolicy.blockedMerchants.join(', ') : '');
    setErrorMsg(null);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id || !isAdmin) return;
    if (validationErrors.length > 0) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const allowedCats = formAllowedCategories
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const blockedMerchs = formBlockedMerchants
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/policy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          currency: formCurrency,
          maxTransactionAmount: formMaxTx.trim(),
          monthlyBudgetCap: formMonthlyCap.trim(),
          requireAdminAbove: formRequireAdminAbove.trim() ? formRequireAdminAbove.trim() : null,
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
      setActiveTab('overview');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error publishing policy version');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
        <p className="text-sm text-slate-500">Loading spend policies...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Required</h2>
        <p className="text-sm text-slate-500 mt-2">
          Sign in with your registered passkey to inspect and author workspace spend policies.
        </p>
        <Link
          href="/auth"
          className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-brand-teal hover:bg-teal-600 text-white font-medium text-sm rounded-lg transition-colors"
        >
          Sign In with Passkey <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Active Workspace</h2>
        <p className="text-sm text-slate-500 mt-2">
          Select or initialize a workspace to view and manage its authoritative spending policies.
        </p>
        <Link
          href="/app/workspaces"
          className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-brand-teal hover:bg-teal-600 text-white font-medium text-sm rounded-lg transition-colors"
        >
          Go to Workspaces <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const symbol = activePolicy ? SUPPORTED_CURRENCIES[activePolicy.currency]?.symbol || '$' : '$';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal">
              Deterministic Policy Engine
            </span>
            <span className="text-xs text-slate-400">Workspace: {activeWorkspace.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Spend Policies & Limits
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Authoritative, version-controlled spending rules evaluated on the server prior to purchase mandate authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activePolicy && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Version {activePolicy.version} Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Policy Error: </span>
            {errorMsg}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-3 text-emerald-700 dark:text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Success: </span>
            {successMsg}
          </div>
        </div>
      )}

      {/* Proposal Binding Invariant Callout */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3.5">
        <Info className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <span className="font-semibold text-slate-900 dark:text-white">
            Immutable Policy Binding (Invariant 6):
          </span>
          <p>
            When a purchase proposal is sealed, it records the exact active policy version and SHA-256 canonical hash.
            Publishing a new policy version governs all future evaluations but never mutates earlier proposals or mandates.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Active Policy
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors relative ${
            activeTab === 'editor'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Policy Editor
          {isDirty && (
            <span className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved changes in draft" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          Version History ({versions.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && activePolicy && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Currency</span>
                <DollarSign className="w-4 h-4 text-brand-teal" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {activePolicy.currency}
              </div>
              <span className="text-xs text-slate-500">
                {SUPPORTED_CURRENCIES[activePolicy.currency]?.decimals} minor decimals
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Max Per Transaction</span>
                <Shield className="w-4 h-4 text-brand-teal" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {symbol}{activePolicy.maxTransactionAmount}
              </div>
              <span className="text-xs text-slate-500">
                {activePolicy.maxTransactionAmountMinor} minor units
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Spend Cap</span>
                <Calendar className="w-4 h-4 text-brand-teal" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {symbol}{activePolicy.monthlyBudgetCap}
              </div>
              <span className="text-xs text-slate-500">
                Cumulative budget per calendar month
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Threshold</span>
                <Lock className="w-4 h-4 text-brand-teal" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {activePolicy.requireAdminAbove ? `${symbol}${activePolicy.requireAdminAbove}` : 'None'}
              </div>
              <span className="text-xs text-slate-500">
                {activePolicy.requireAdminAbove ? 'Requires workspace Admin' : 'Any member can execute'}
              </span>
            </div>
          </div>

          {/* Details & Canonical Hash */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {activePolicy.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Activated on {new Date(activePolicy.createdAt).toLocaleString()}
                </p>
              </div>

              {isAdmin ? (
                <button
                  onClick={() => setActiveTab('editor')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal text-xs font-semibold rounded-lg transition-colors"
                >
                  Edit / Revise Policy
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Read-only view (MEMBER role)
                </span>
              )}
            </div>

            {/* Content Hash Monospace Display */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Canonical SHA-256 Content Hash</span>
                <button
                  onClick={() => handleCopyHash(activePolicy.contentHash)}
                  className="flex items-center gap-1 text-xs text-brand-teal hover:underline"
                >
                  {copiedHash === activePolicy.contentHash ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Hash</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all select-all">
                {activePolicy.contentHash}
              </p>
            </div>

            {/* Allowed & Blocked Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Category Allowlist
                </span>
                <div className="mt-1.5">
                  {activePolicy.allowedCategories && activePolicy.allowedCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {activePolicy.allowedCategories.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">All categories permitted</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Merchant Denylist
                </span>
                <div className="mt-1.5">
                  {activePolicy.blockedMerchants && activePolicy.blockedMerchants.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {activePolicy.blockedMerchants.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded text-xs"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No merchants blocked</span>
                  )}
                </div>
              </div>
            </div>

            {/* Canonical JSON display */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Deterministic Canonical Representation
              </span>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
                {JSON.stringify(JSON.parse(activePolicy.canonicalContent), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {!isAdmin && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-3 text-amber-800 dark:text-amber-400 text-sm">
              <Lock className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Administrator Authorization Required: </span>
                Only users with the <span className="font-mono font-bold">ADMIN</span> role in this workspace can publish and activate new policy versions.
              </div>
            </div>
          )}

          <form onSubmit={handleSavePolicy} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Publish New Policy Version
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Modifications will create Version {(activePolicy?.version || 0) + 1} and atomically archive Version {activePolicy?.version}.
                </p>
              </div>

              {isDirty ? (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full text-xs font-medium text-amber-700 dark:text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved Changes (Draft)
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Matches current active policy
                </div>
              )}
            </div>

            {/* Validation Errors Box */}
            {validationErrors.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl space-y-1 text-xs text-red-700 dark:text-red-400">
                <span className="font-semibold block mb-1">Please correct the following:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Policy Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Policy Name / Description
                </label>
                <input
                  type="text"
                  disabled={!isAdmin || isSaving}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Q4 Standard Spending Policy"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
                  required
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Workspace Currency
                </label>
                <select
                  disabled={!isAdmin || isSaving}
                  value={formCurrency}
                  onChange={(e) => setFormCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
                >
                  {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol}) — {curr.decimals} minor decimals
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  All proposal amounts must strictly match this currency.
                </p>
              </div>

              {/* Max Per-Transaction Cap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Per-Transaction Cap ({SUPPORTED_CURRENCIES[formCurrency]?.symbol || '$'})
                </label>
                <input
                  type="text"
                  disabled={!isAdmin || isSaving}
                  value={formMaxTx}
                  onChange={(e) => setFormMaxTx(e.target.value)}
                  placeholder="250.00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Maximum total amount permitted for any individual checkout proposal.
                </p>
              </div>

              {/* Monthly Budget Cap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Budget Cap ({SUPPORTED_CURRENCIES[formCurrency]?.symbol || '$'})
                </label>
                <input
                  type="text"
                  disabled={!isAdmin || isSaving}
                  value={formMonthlyCap}
                  onChange={(e) => setFormMonthlyCap(e.target.value)}
                  placeholder="1000.00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Cumulative aggregate expenditure limit across the workspace per calendar month.
                </p>
              </div>

              {/* Admin Threshold */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Require Admin Approval Above ({SUPPORTED_CURRENCIES[formCurrency]?.symbol || '$'}) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  disabled={!isAdmin || isSaving}
                  value={formRequireAdminAbove}
                  onChange={(e) => setFormRequireAdminAbove(e.target.value)}
                  placeholder="Leave blank for no escalation"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Proposals exceeding this amount escalate to status REQUIRES_ADMIN_APPROVAL.
                </p>
              </div>

              {/* Category Allowlist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Allowed Categories <span className="text-slate-400 font-normal">(Comma-separated, optional)</span>
                </label>
                <input
                  type="text"
                  disabled={!isAdmin || isSaving}
                  value={formAllowedCategories}
                  onChange={(e) => setFormAllowedCategories(e.target.value)}
                  placeholder="Office Supplies, Software, Electronics"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  If defined, only items matching these merchant categories pass policy.
                </p>
              </div>

              {/* Blocked Merchants */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Blocked Merchants <span className="text-slate-400 font-normal">(Comma-separated, optional)</span>
                </label>
                <input
                  type="text"
                  disabled={!isAdmin || isSaving}
                  value={formBlockedMerchants}
                  onChange={(e) => setFormBlockedMerchants(e.target.value)}
                  placeholder="Untrusted Vendor, Shady Corp"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-60"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Proposals containing these merchant names will be deterministically rejected.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleResetForm}
                disabled={!isDirty || isSaving}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors"
              >
                Discard Draft Changes
              </button>

              <button
                type="submit"
                disabled={!isAdmin || isSaving || validationErrors.length > 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-teal hover:bg-teal-600 text-white font-medium text-sm rounded-xl disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Canonical Version...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4" />
                    <span>Publish & Activate Version {(activePolicy?.version || 0) + 1}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Immutable Policy Version Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Every policy update is persisted as an append-only version with a computed SHA-256 hash. Historical records are never deleted or mutated.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Caps (Tx / Month)</th>
                    <th className="py-3 px-4">SHA-256 Hash</th>
                    <th className="py-3 px-4">Activated At</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {versions.map((v) => {
                    const vSymbol = SUPPORTED_CURRENCIES[v.currency]?.symbol || '$';
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          v{v.version}
                        </td>
                        <td className="py-3.5 px-4">
                          {v.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Archived
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {v.name}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                          {vSymbol}{v.maxTransactionAmount} / {vSymbol}{v.monthlyBudgetCap}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {v.contentHash.slice(0, 12)}...
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedInspectVersion(v)}
                            className="text-brand-teal hover:underline font-semibold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {selectedInspectVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Version {selectedInspectVersion.version}: {selectedInspectVersion.name}
                </h3>
                <span className="text-xs text-slate-500">
                  Created {new Date(selectedInspectVersion.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedInspectVersion(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Full SHA-256 Content Hash
                </span>
                <p className="font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg text-slate-700 dark:text-slate-300 break-all select-all">
                  {selectedInspectVersion.contentHash}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Canonical Content (JSON)
                </span>
                <pre className="p-3 bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto max-h-60">
                  {JSON.stringify(JSON.parse(selectedInspectVersion.canonicalContent), null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedInspectVersion(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

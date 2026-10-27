'use client';

import React, { useState } from 'react';
import { Shield, History, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { FormattedPolicyDTO } from '@/ui/components/policies/types';
import { useWorkspacePolicy } from '@/ui/hooks/useWorkspacePolicy';
import { PolicyPageHeader } from '@/ui/components/policies/PolicyPageHeader';
import { PolicyEmptyStates } from '@/ui/components/policies/PolicyEmptyStates';
import { PolicyOverviewTab } from '@/ui/components/policies/PolicyOverviewTab';
import { PolicyEditorTab } from '@/ui/components/policies/PolicyEditorTab';
import { PolicyHistoryTab } from '@/ui/components/policies/PolicyHistoryTab';
import { PolicyInspectModal } from '@/ui/components/policies/PolicyInspectModal';

export default function PoliciesPage() {
  const { isAuthenticated, isLoading: authLoading, activeWorkspace } = useAuth();
  const isAdmin = activeWorkspace?.role === 'ADMIN';

  const {
    activePolicy, versions, isLoading, isSaving, errorMsg, successMsg, copiedHash, isDirty,
    validationErrors, formName, setFormName, formCurrency, setFormCurrency, formMaxTx, setFormMaxTx,
    formMonthlyCap, setFormMonthlyCap, formRequireAdminAbove, setFormRequireAdminAbove,
    formAllowedCategories, setFormAllowedCategories, formBlockedMerchants, setFormBlockedMerchants,
    handleCopyHash, handleResetForm, handleSavePolicy,
  } = useWorkspacePolicy(activeWorkspace?.id, isAuthenticated, isAdmin);

  const [activeTab, setActiveTab] = useState<'overview' | 'editor' | 'history'>('overview');
  const [selectedInspectVersion, setSelectedInspectVersion] = useState<FormattedPolicyDTO | null>(null);

  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
        <p className="text-sm text-slate-500">Loading spend policies...</p>
      </div>
    );
  }

  if (!isAuthenticated || !activeWorkspace) {
    return <PolicyEmptyStates isAuthenticated={isAuthenticated} hasActiveWorkspace={!!activeWorkspace} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <PolicyPageHeader
        workspaceName={activeWorkspace.name}
        activePolicy={activePolicy}
        errorMsg={errorMsg}
        successMsg={successMsg}
      />

      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />Active Policy
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors relative ${
            activeTab === 'editor' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />Policy Editor
          {isDirty && <span className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved changes in draft" />}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />Version History ({versions.length})
        </button>
      </div>

      {activeTab === 'overview' && activePolicy && (
        <PolicyOverviewTab
          activePolicy={activePolicy}
          isAdmin={isAdmin}
          onEditClick={() => setActiveTab('editor')}
          copiedHash={copiedHash}
          onCopyHash={handleCopyHash}
        />
      )}

      {activeTab === 'editor' && (
        <PolicyEditorTab
          isAdmin={isAdmin}
          isSaving={isSaving}
          isDirty={isDirty}
          activePolicy={activePolicy}
          formName={formName} setFormName={setFormName}
          formCurrency={formCurrency} setFormCurrency={setFormCurrency}
          formMaxTx={formMaxTx} setFormMaxTx={setFormMaxTx}
          formMonthlyCap={formMonthlyCap} setFormMonthlyCap={setFormMonthlyCap}
          formRequireAdminAbove={formRequireAdminAbove} setFormRequireAdminAbove={setFormRequireAdminAbove}
          formAllowedCategories={formAllowedCategories} setFormAllowedCategories={setFormAllowedCategories}
          formBlockedMerchants={formBlockedMerchants} setFormBlockedMerchants={setFormBlockedMerchants}
          validationErrors={validationErrors}
          onReset={handleResetForm}
          onSave={(e) => handleSavePolicy(e, () => setActiveTab('overview'))}
        />
      )}

      {activeTab === 'history' && (
        <PolicyHistoryTab versions={versions} onInspect={setSelectedInspectVersion} />
      )}

      {selectedInspectVersion && (
        <PolicyInspectModal version={selectedInspectVersion} onClose={() => setSelectedInspectVersion(null)} />
      )}
    </div>
  );
}

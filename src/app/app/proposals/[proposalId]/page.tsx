'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { useProposalDetail } from '@/ui/hooks/use-proposal-detail';
import { ProposalStatusBadge } from '@/ui/components/proposal/ProposalStatusBadge';
import { ProposalPolicyCard } from '@/ui/components/proposal/ProposalPolicyCard';
import { ProposalBasketTable } from '@/ui/components/proposal/ProposalBasketTable';
import { ProposalTermsDigest } from '@/ui/components/proposal/ProposalTermsDigest';
import { ProposalAuthorizeBar } from '@/ui/components/proposal/ProposalAuthorizeBar';

export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = params?.proposalId as string;
  const { isAuthenticated, isLoading: authLoading, activeWorkspace } = useAuth();

  const {
    proposal,
    isLoading,
    isActionLoading,
    errorMsg,
    updateBasket,
    sealProposal,
    unsealProposal,
    authorizeProposal,
  } = useProposalDetail(activeWorkspace?.id, proposalId);

  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
        <p className="text-xs text-slate-500">Loading proposal review...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
        <Lock className="w-10 h-10 text-brand-teal mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Authentication Required</h2>
        <p className="text-xs text-slate-500 mt-1">Sign in with your passkey to review proposals.</p>
        <Link href="/auth" className="mt-5 inline-block w-full py-2 px-4 bg-brand-teal text-white font-medium text-xs rounded-lg">
          Sign In with Passkey
        </Link>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-6 bg-white dark:bg-slate-900 border rounded-xl text-center">
        <p className="text-sm text-slate-600">Proposal not found or you lack permission to view it.</p>
      </div>
    );
  }

  const isModifiable = proposal.status === 'NEEDS_REVIEW' || proposal.status === 'DRAFT' || proposal.status === 'BLOCKED';
  const isExpired = new Date(proposal.expiresAt) < new Date() && proposal.status !== 'AUTHORIZED';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <Link
          href={`/app/purchases/${proposal.sourceRequestId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Purchase Request
        </Link>
        <ProposalStatusBadge status={proposal.status} expiresAt={proposal.expiresAt} />
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Mandate Review & Authorization
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Payee / Merchant: <span className="font-semibold text-slate-700 dark:text-slate-300">{proposal.merchant}</span>
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <ProposalPolicyCard
        evaluation={proposal.policyEvaluation}
        policyVersion={proposal.policyVersion}
        policyHash={proposal.policyHash}
      />

      <ProposalBasketTable
        items={proposal.items}
        currency={proposal.currency}
        totalAmount={proposal.totalAmount}
        isModifiable={isModifiable}
        onUpdateBasket={updateBasket}
        isUpdating={isActionLoading}
      />

      <ProposalTermsDigest
        termsHash={proposal.termsHash}
        canonicalTermsJson={proposal.canonicalTermsJson}
      />

      <ProposalAuthorizeBar
        status={proposal.status}
        policyPassed={proposal.policyEvaluation.passed}
        isExpired={isExpired}
        onSeal={sealProposal}
        onUnseal={unsealProposal}
        onAuthorize={authorizeProposal}
        isLoading={isActionLoading}
        authorizedAt={proposal.authorizedAt}
        authorizedBy={proposal.authorizedBy}
      />
    </div>
  );
}

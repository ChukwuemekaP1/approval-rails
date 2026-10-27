'use client';

import React from 'react';
import { PurchaseRequestDTO } from '@/application/purchase/purchase-use-cases';
import { PurchaseCandidateCard } from './PurchaseCandidateCard';

interface Props {
  candidates: PurchaseRequestDTO['candidates'];
  recommendedCandidateId?: string | null;
  comparisons?: PurchaseRequestDTO['summary'] extends { comparisons: (infer C)[] } ? C[] : any[];
  onCreateProposal: (id: string) => void;
  creatingCandidateId: string | null;
}

export function PurchaseCandidateList({
  candidates,
  recommendedCandidateId,
  comparisons,
  onCreateProposal,
  creatingCandidateId,
}: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
        <span>Catalog Candidates ({candidates.length})</span>
        <span className="text-[11px] text-slate-400 font-normal">Authoritative snapshots with source attribution</span>
      </h2>

      {candidates.length === 0 ? (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-500">
          No product candidates have been retrieved yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <PurchaseCandidateCard
              key={c.id}
              candidate={c}
              isRecommended={recommendedCandidateId === c.id}
              comparison={comparisons?.find((comp) => comp.candidateId === c.id)}
              onCreateProposal={onCreateProposal}
              isCreating={creatingCandidateId === c.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProposalDTO } from '@/application/proposal/proposal-dto';
import {
  fetchProposalApi,
  updateBasketApi,
  sealProposalApi,
  unsealProposalApi,
  authorizeProposalApi,
  authorizeProposalWithPinApi,
} from './proposal-api';

export function useProposalDetail(workspaceId?: string, proposalId?: string) {
  const [proposal, setProposal] = useState<ProposalDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProposal = useCallback(async () => {
    if (!workspaceId || !proposalId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchProposalApi(workspaceId, proposalId);
      setProposal(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading proposal');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, proposalId]);

  useEffect(() => {
    if (workspaceId && proposalId) {
      fetchProposal();
    } else {
      setIsLoading(false);
    }
  }, [workspaceId, proposalId, fetchProposal]);

  const updateBasket = async (items: Array<{ candidateId: string; quantity: number }>) => {
    if (!workspaceId || !proposalId) return;
    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      const data = await updateBasketApi(workspaceId, proposalId, items);
      setProposal(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error revising basket');
    } finally {
      setIsActionLoading(false);
    }
  };

  const sealProposal = async () => {
    if (!workspaceId || !proposalId) return;
    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      const data = await sealProposalApi(workspaceId, proposalId);
      setProposal(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sealing proposal');
    } finally {
      setIsActionLoading(false);
    }
  };

  const unsealProposal = async () => {
    if (!workspaceId || !proposalId) return;
    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      const data = await unsealProposalApi(workspaceId, proposalId);
      setProposal(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error unsealing proposal');
    } finally {
      setIsActionLoading(false);
    }
  };

  const authorizeProposal = async () => {
    if (!workspaceId || !proposalId) return;
    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      const data = await authorizeProposalApi(workspaceId, proposalId);
      setProposal(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authorization failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const authorizeProposalWithPin = async (pin: string = '123456') => {
    if (!workspaceId || !proposalId) return;
    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      const data = await authorizeProposalWithPinApi(workspaceId, proposalId, pin);
      setProposal(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'PIN authorization failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    proposal,
    isLoading,
    isActionLoading,
    errorMsg,
    updateBasket,
    sealProposal,
    unsealProposal,
    authorizeProposal,
    authorizeProposalWithPin,
  };
}

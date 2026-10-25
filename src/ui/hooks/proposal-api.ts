'use client';

import { startAuthentication } from '@simplewebauthn/browser';
import { ProposalDTO } from '@/application/proposal/proposal-dto';

export async function fetchProposalApi(workspaceId: string, proposalId: string): Promise<ProposalDTO> {
  const res = await fetch(`/api/v1/workspaces/${workspaceId}/proposals/${proposalId}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to load proposal');
  }
  const data = await res.json();
  return data.proposal;
}

export async function updateBasketApi(
  workspaceId: string,
  proposalId: string,
  items: Array<{ candidateId: string; quantity: number }>
): Promise<ProposalDTO> {
  const res = await fetch(`/api/v1/workspaces/${workspaceId}/proposals/${proposalId}/basket`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to revise basket');
  }
  const data = await res.json();
  return data.proposal;
}

export async function sealProposalApi(workspaceId: string, proposalId: string): Promise<ProposalDTO> {
  const res = await fetch(`/api/v1/workspaces/${workspaceId}/proposals/${proposalId}/seal`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to seal proposal');
  }
  const data = await res.json();
  return data.proposal;
}

export async function unsealProposalApi(workspaceId: string, proposalId: string): Promise<ProposalDTO> {
  const res = await fetch(`/api/v1/workspaces/${workspaceId}/proposals/${proposalId}/unseal`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to unseal proposal');
  }
  const data = await res.json();
  return data.proposal;
}

export async function authorizeProposalApi(workspaceId: string, proposalId: string): Promise<ProposalDTO> {
  const optsRes = await fetch(
    `/api/v1/workspaces/${workspaceId}/proposals/${proposalId}/auth-options`,
    { method: 'POST' }
  );
  if (!optsRes.ok) {
    const err = await optsRes.json();
    throw new Error(err.detail || 'Failed to get authorization options');
  }
  const { options } = await optsRes.json();
  const asseResp = await startAuthentication({ optionsJSON: options });

  const authRes = await fetch(
    `/api/v1/workspaces/${workspaceId}/proposals/${proposalId}/authorize`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: asseResp }),
    }
  );
  if (!authRes.ok) {
    const err = await authRes.json();
    throw new Error(err.detail || 'Passkey assertion verification failed');
  }
  const data = await authRes.json();
  return data.proposal;
}

import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { challengeRepo } from '@/infrastructure/repositories/challenge-repository';
import { passkeyRepo } from '@/infrastructure/repositories/passkey-repository';
import { webAuthnAdapter } from '@/infrastructure/auth/webauthn-adapter';
import { authorizationService } from '@/application/auth/authorization-service';
import { computeTermsHash } from '@/domain/proposal/canonicalize';
import { assertValidTransition } from '@/domain/proposal/state-machine';
import { Proposal } from '@/domain/proposal/types';
import { AuthenticationResponseJSON } from '@simplewebauthn/server';

export async function generateAuthorizationOptions(
  proposalId: string,
  workspaceId: string,
  principalId: string
) {
  const member = await authorizationService.authorizeWorkspace(principalId, workspaceId);
  const proposal = await proposalRepo.getById(proposalId, workspaceId);
  if (!proposal) throw new Error('Proposal not found');

  if (proposal.status !== 'SEALED') {
    throw new Error(`Cannot authorize proposal in status ${proposal.status}. Must be SEALED.`);
  }

  if (new Date() > proposal.expiresAt) {
    await proposalRepo.updateStatus(proposalId, workspaceId, 'EXPIRED');
    throw new Error('Proposal has expired');
  }

  if (proposal.policyEvaluation.status === 'REQUIRES_ADMIN_APPROVAL' && member.role !== 'ADMIN') {
    throw new Error('Proposal requires ADMIN role authorization');
  }

  const passkeys = await passkeyRepo.listByPrincipalId(principalId);
  if (passkeys.length === 0) {
    throw new Error('No registered passkey found for authorization');
  }

  const options = await webAuthnAdapter.getAuthenticationOptions({
    allowCredentials: passkeys,
  });

  await challengeRepo.create({
    challenge: options.challenge,
    flowType: 'MANDATE_AUTHORIZATION',
    principalId,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await proposalRepo.updateStatus(proposalId, workspaceId, 'SEALED', {
    authChallenge: options.challenge,
  });

  return options;
}

export async function authorizeProposal(
  proposalId: string,
  workspaceId: string,
  principalId: string,
  response: AuthenticationResponseJSON
): Promise<Proposal> {
  const member = await authorizationService.authorizeWorkspace(principalId, workspaceId);
  const proposal = await proposalRepo.getById(proposalId, workspaceId);
  if (!proposal) throw new Error('Proposal not found');

  if (proposal.status !== 'SEALED') {
    throw new Error(`Proposal must be in SEALED state to authorize`);
  }

  if (new Date() > proposal.expiresAt) {
    await proposalRepo.updateStatus(proposalId, workspaceId, 'EXPIRED');
    throw new Error('Proposal has expired');
  }

  if (proposal.policyEvaluation.status === 'REQUIRES_ADMIN_APPROVAL' && member.role !== 'ADMIN') {
    throw new Error('Proposal requires ADMIN role authorization');
  }

  if (!proposal.authChallenge) {
    throw new Error('No active authorization challenge found on proposal');
  }

  const challenge = await challengeRepo.findValidChallenge(
    proposal.authChallenge,
    'MANDATE_AUTHORIZATION'
  );
  if (!challenge) {
    throw new Error('Invalid or expired authorization challenge');
  }

  const passkey = await passkeyRepo.findByCredentialId(response.id);
  if (!passkey || passkey.principalId !== principalId) {
    throw new Error('Invalid or unrecognized credential');
  }

  const verification = await webAuthnAdapter.verifyAuthentication({
    response,
    expectedChallenge: challenge.challenge,
    passkey,
  });

  if (!verification.verified) {
    throw new Error('WebAuthn signature verification failed');
  }

  const recomputedHash = computeTermsHash(proposal.canonicalTermsJson);
  if (recomputedHash !== proposal.termsHash) {
    throw new Error('Proposal terms integrity violation');
  }

  await passkeyRepo.updateCounter(passkey.credentialId, verification.authenticationInfo.newCounter);
  await challengeRepo.markUsed(challenge.id);

  assertValidTransition(proposal.status, 'AUTHORIZED');
  await proposalRepo.recordAuthorization(proposalId, workspaceId, principalId, {
    credentialId: passkey.credentialId,
    counter: verification.authenticationInfo.newCounter,
    authorizedAt: new Date().toISOString(),
  });

  return (await proposalRepo.getById(proposalId, workspaceId))!;
}

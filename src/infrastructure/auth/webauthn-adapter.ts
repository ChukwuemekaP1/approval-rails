import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransport,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { getEnv } from '../config/env';
import { Passkey } from '@/domain/identity/types';

export class WebAuthnAdapter {
  private getRPConfig() {
    const env = getEnv();
    return {
      rpName: env.WEBAUTHN_RP_NAME,
      rpID: env.WEBAUTHN_RP_ID,
      origin: env.WEBAUTHN_ORIGIN,
    };
  }

  async getRegistrationOptions(params: {
    email: string;
    displayName: string;
    existingCredentials?: Passkey[];
  }) {
    const { rpName, rpID } = this.getRPConfig();

    return generateRegistrationOptions({
      rpName,
      rpID,
      userID: isoBase64URL.toBuffer(isoBase64URL.fromUTF8String(params.email)),
      userName: params.email,
      userDisplayName: params.displayName,
      attestationType: 'none',
      excludeCredentials: params.existingCredentials?.map((cred) => ({
        id: cred.credentialId,
        transports: (cred.transports as AuthenticatorTransport[]) || undefined,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });
  }

  async verifyRegistration(params: {
    response: RegistrationResponseJSON;
    expectedChallenge: string;
  }) {
    const { rpID, origin } = this.getRPConfig();

    return verifyRegistrationResponse({
      response: params.response,
      expectedChallenge: params.expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
  }

  async getAuthenticationOptions(params?: { allowCredentials?: Passkey[] }) {
    const { rpID } = this.getRPConfig();

    return generateAuthenticationOptions({
      rpID,
      allowCredentials: params?.allowCredentials?.map((cred) => ({
        id: cred.credentialId,
        transports: (cred.transports as AuthenticatorTransport[]) || undefined,
      })),
      userVerification: 'preferred',
    });
  }

  async verifyAuthentication(params: {
    response: AuthenticationResponseJSON;
    expectedChallenge: string;
    passkey: Passkey;
  }) {
    const { rpID, origin } = this.getRPConfig();

    return verifyAuthenticationResponse({
      response: params.response,
      expectedChallenge: params.expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: params.passkey.credentialId,
        publicKey: isoBase64URL.toBuffer(params.passkey.publicKey),
        counter: params.passkey.counter,
        transports: (params.passkey.transports as AuthenticatorTransport[]) || undefined,
      },
      requireUserVerification: false,
    });
  }
}

export const webAuthnAdapter = new WebAuthnAdapter();

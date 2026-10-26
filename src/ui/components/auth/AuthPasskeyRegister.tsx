'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fingerprint, Loader2 } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import { useAuth } from '@/ui/context/AuthContext';

interface Props {
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export function AuthPasskeyRegister({ onError, onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshSession } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const optRes = await fetch('/api/v1/auth/passkey/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName }),
      });
      if (!optRes.ok) {
        const err = await optRes.json();
        throw new Error(err.detail || 'Failed to retrieve challenge');
      }
      const options = await optRes.json();
      let attResp;
      try {
        attResp = await startRegistration({ optionsJSON: options });
      } catch (clientErr: any) {
        if (clientErr.name === 'NotAllowedError') {
          throw new Error('Passkey creation was canceled on your device.');
        }
        throw new Error(clientErr.message || 'Passkey creation failed.');
      }
      const verifyRes = await fetch('/api/v1/auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName, response: attResp }),
      });
      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.detail || 'Passkey verification failed.');
      }
      onSuccess('Passkey registered! Initializing workspace...');
      await refreshSession();
      router.push('/app');
      router.refresh();
    } catch (err: any) {
      onError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
          Email Address
        </label>
        <input
          id="reg-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alice@company.com"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus-visible:ring-2 focus-visible:ring-sky-500"
        />
      </div>
      <div>
        <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
          Display Name
        </label>
        <input
          id="reg-name"
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Alice Johnson"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus-visible:ring-2 focus-visible:ring-sky-500"
        />
      </div>
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-60 min-h-[48px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Communicating with Authenticator...
            </>
          ) : (
            <>
              <Fingerprint className="w-5 h-5 mr-2" />
              Create & Bind Passkey
            </>
          )}
        </button>
      </div>
    </form>
  );
}

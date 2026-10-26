'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';

interface Props {
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export function AuthPinForm({ onError, onSuccess }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pin, setPin] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshSession } = useAuth();

  const handlePinSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName, pin, isSignUp }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Invalid PIN or sign in failed');
      }
      onSuccess(isSignUp ? 'Account created! Initializing workspace...' : 'Authenticated! Initializing workspace...');
      await refreshSession();
      router.push('/app');
      router.refresh();
    } catch (err: any) {
      onError(err.message || 'Error signing in with PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handlePinSignIn} className="space-y-4">
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-2">
        <button
          type="button"
          onClick={() => setIsSignUp(false)}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            !isSignUp ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(true)}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            isSignUp ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Create Account
        </button>
      </div>
      <div>
        <label htmlFor="pin-email" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
          Email Address
        </label>
        <input
          id="pin-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alice@company.com"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus-visible:ring-2 focus-visible:ring-sky-500"
        />
      </div>
      {isSignUp && (
        <div>
          <label htmlFor="pin-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Display Name
          </label>
          <input
            id="pin-name"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Alice Johnson"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus-visible:ring-2 focus-visible:ring-sky-500"
          />
        </div>
      )}
      <div>
        <label htmlFor="pin-code" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
          {isSignUp ? 'Choose Password / PIN' : 'Password / PIN'}
        </label>
        <input
          id="pin-code"
          type="password"
          required
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder={isSignUp ? 'Enter a password or PIN' : '123456'}
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
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : (
            <>
              <KeyRound className="w-5 h-5 mr-2" />
              {isSignUp ? 'Create Account with Password / PIN' : 'Sign In with Password / PIN'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

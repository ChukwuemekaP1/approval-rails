'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Fingerprint,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Loader2,
  UserPlus,
  LogIn,
  KeyRound,
} from 'lucide-react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { useAuth } from '@/ui/context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'register' | 'pin'>('signin');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pin, setPin] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const { refreshSession } = useAuth();

  const handlePinSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
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

      setSuccessMsg(isSignUp ? 'Account created! Initializing workspace...' : 'Authenticated! Initializing workspace...');
      await refreshSession();
      router.push('/app');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error signing in with PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      // 1. Get registration options from server
      const optRes = await fetch('/api/v1/auth/passkey/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName }),
      });

      if (!optRes.ok) {
        const err = await optRes.json();
        throw new Error(err.detail || 'Failed to retrieve passkey registration challenge');
      }

      const options = await optRes.json();

      // 2. Invoke WebAuthn authenticator in browser
      let attResp;
      try {
        attResp = await startRegistration({ optionsJSON: options });
      } catch (clientErr: any) {
        if (clientErr.name === 'NotAllowedError') {
          throw new Error('Passkey creation was canceled or timed out on your device.');
        }
        throw new Error(clientErr.message || 'Passkey creation failed on your authenticator.');
      }

      // 3. Verify assertion with server
      const verifyRes = await fetch('/api/v1/auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          displayName,
          response: attResp,
        }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.detail || 'Passkey verification failed on the server.');
      }

      setSuccessMsg('Passkey registered! Initializing your workspace...');
      await refreshSession();
      router.push('/app');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      // 1. Get authentication options
      const optRes = await fetch('/api/v1/auth/passkey/auth-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email ? { email } : {}),
      });

      if (!optRes.ok) {
        const err = await optRes.json();
        throw new Error(err.detail || 'Failed to get authentication challenge');
      }

      const options = await optRes.json();

      // 2. Invoke browser WebAuthn assertion
      let asseResp;
      try {
        asseResp = await startAuthentication({ optionsJSON: options });
      } catch (clientErr: any) {
        if (clientErr.name === 'NotAllowedError') {
          throw new Error('Authentication was canceled or timed out.');
        }
        throw new Error(clientErr.message || 'Authenticator interaction failed.');
      }

      // 3. Verify assertion with server
      const verifyRes = await fetch('/api/v1/auth/passkey/auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: asseResp }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.detail || 'Authentication assertion verification failed.');
      }

      setSuccessMsg('Authentication successful! Loading dashboard...');
      await refreshSession();
      router.push('/app');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Approve<span className="text-sky-600 dark:text-sky-400">Rail</span>
        </h1>
        <p className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400">
          Hardware-bound WebAuthn / FIDO2 Passkey Authentication
        </p>

        {/* Mode Selector Tabs */}
        <div className="mt-6 flex justify-center border-b border-gray-200 dark:border-gray-800" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold border-b-2 transition-colors min-h-[44px] ${
              mode === 'signin'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold border-b-2 transition-colors min-h-[44px] ${
              mode === 'register'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register Passkey
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'pin'}
            onClick={() => {
              setMode('pin');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold border-b-2 transition-colors min-h-[44px] ${
              mode === 'pin'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            PIN / Password
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-gray-900 py-8 px-6 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 space-y-6">
          {errorMsg && (
            <div
              className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-xs flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2"
              role="status"
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
                >
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
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
                >
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
          ) : mode === 'pin' ? (
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
                <label
                  htmlFor="pin-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
                >
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
                  <label
                    htmlFor="pin-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
                  >
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
                <label
                  htmlFor="pin-code"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
                >
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
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email Address (Optional for Discoverable Passkeys)
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice@company.com"
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
                      Verifying with Authenticator...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-5 h-5 mr-2" />
                      Authenticate with Passkey
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs">
            <Link
              href="/app"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Return to App Shell
            </Link>

            <span className="text-[11px] text-gray-400">
              WebAuthn / FIDO2 Level 3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

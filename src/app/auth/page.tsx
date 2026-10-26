'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, UserPlus, LogIn, KeyRound, ArrowLeft } from 'lucide-react';
import { AuthPasskeySignIn } from '@/ui/components/auth/AuthPasskeySignIn';
import { AuthPasskeyRegister } from '@/ui/components/auth/AuthPasskeyRegister';
import { AuthPinForm } from '@/ui/components/auth/AuthPinForm';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'register' | 'pin'>('signin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetMessages = (newMode: 'signin' | 'register' | 'pin') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
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

        <div className="mt-6 flex justify-center border-b border-gray-200 dark:border-gray-800" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            onClick={() => resetMessages('signin')}
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
            onClick={() => resetMessages('register')}
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
            onClick={() => resetMessages('pin')}
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
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-xs flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2" role="status">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'register' && <AuthPasskeyRegister onError={setErrorMsg} onSuccess={setSuccessMsg} />}
          {mode === 'pin' && <AuthPinForm onError={setErrorMsg} onSuccess={setSuccessMsg} />}
          {mode === 'signin' && <AuthPasskeySignIn onError={setErrorMsg} onSuccess={setSuccessMsg} />}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs">
            <Link href="/app" className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 min-h-[44px]">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Return to App Shell
            </Link>
            <span className="text-[11px] text-gray-400">WebAuthn / FIDO2 Level 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}

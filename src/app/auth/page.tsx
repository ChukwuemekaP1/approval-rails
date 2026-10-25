import React from 'react';
import Link from 'next/link';
import { Fingerprint, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Passkey Authentication
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Cryptographically bound to your physical authenticator
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-gray-900 py-8 px-6 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 space-y-6">
          <div className="rounded-lg bg-sky-50 dark:bg-sky-950/50 p-4 border border-sky-100 dark:border-sky-900">
            <div className="flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-sky-600 dark:text-sky-400 mt-0.5" />
              <div>
                <h2 className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                  Phase 2 Implementation Target
                </h2>
                <p className="text-xs text-sky-800 dark:text-sky-300 mt-1">
                  ApproveRail uses WebAuthn/FIDO2 passkeys via SimpleWebAuthn. No passwords or authenticator private keys are ever stored on the server.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-sky-600/60 cursor-not-allowed min-h-[48px]"
              aria-disabled="true"
            >
              <Fingerprint className="w-5 h-5 mr-2" />
              Sign In with Passkey (Phase 2)
            </button>
            <p className="text-center text-xs text-gray-500">
              WebAuthn registration and authentication will be wired in Phase 2.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-center">
            <Link
              href="/app"
              className="inline-flex items-center text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Continue to Application Shell
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

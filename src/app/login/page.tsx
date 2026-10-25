'use client';

import React from 'react';
import Link from 'next/link';
import { LoginForm } from '@/ui/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold shadow-md">
            AR
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white">ApproveRail</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          AI proposes. You authorize. Every payment leaves proof.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl sm:px-10">
          <LoginForm />

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

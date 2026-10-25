'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2, AlertCircle, Fingerprint } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';

export function LoginForm() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Login failed. Please check credentials.');
      }

      await refreshSession();
      router.push('/app/shop');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="font-medium text-slate-700 dark:text-slate-300">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="font-medium text-slate-700 dark:text-slate-300">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or</span>
        </div>
      </div>

      <Link
        href="/auth"
        className="w-full py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <Fingerprint className="w-4 h-4 text-teal-600" /> Sign In with Passkey or PIN
      </Link>
    </div>
  );
}

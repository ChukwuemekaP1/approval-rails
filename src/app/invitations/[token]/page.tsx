'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';

export default function AcceptInvitationPage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();
  const { isAuthenticated, refreshSession } = useAuth();

  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const res = await fetch(`/api/v1/invitations/${token}`);
        if (!res.ok) throw new Error('Invalid or expired invitation link');
        setDetails(await res.json());
      } catch (err: any) {
        setErrorMsg(err.message || 'Error loading invitation');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [token]);

  const handleAccept = async () => {
    setIsAccepting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/invitations/${token}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to accept invitation');
      setSuccess(true);
      await refreshSession();
      setTimeout(() => router.push('/app/shop'), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error accepting invitation');
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
          <Building2 className="w-12 h-12 text-teal-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workspace Invitation</h2>

          {errorMsg ? (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : success ? (
            <div className="mt-4 p-4 rounded-lg bg-teal-50 text-teal-800 text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span>Accepted! Redirecting...</span>
            </div>
          ) : details?.isAccepted ? (
            <p className="mt-4 text-xs text-slate-500">Already accepted.</p>
          ) : details?.isExpired ? (
            <p className="mt-4 text-xs text-rose-600">Link has expired.</p>
          ) : (
            <div className="mt-4 space-y-4 text-xs text-slate-600 dark:text-slate-400">
              <p>
                <span className="font-semibold text-slate-900 dark:text-white">{details?.inviter?.displayName}</span>{' '}
                invited you to <span className="font-semibold text-teal-600">{details?.workspace?.name}</span> as{' '}
                <span className="font-semibold uppercase text-slate-900 dark:text-white">{details?.role}</span>.
              </p>

              {isAuthenticated ? (
                <button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAccepting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept & Join Workspace'}
                </button>
              ) : (
                <div className="space-y-2 pt-2">
                  <p className="text-slate-500">Sign in or create account to accept:</p>
                  <Link
                    href={`/signup?invitation=${token}`}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg flex items-center justify-center gap-1.5"
                  >
                    Create Account <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/login?invitation=${token}`}
                    className="w-full py-2 border border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

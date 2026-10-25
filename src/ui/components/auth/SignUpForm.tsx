'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { SignUpFields } from './SignUpFields';

export function SignUpForm() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [workspaceType, setWorkspaceType] = useState<'PERSONAL' | 'BUSINESS'>('PERSONAL');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
          workspaceType,
          businessName: workspaceType === 'BUSINESS' ? businessName : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.title || 'Registration failed');
      await refreshSession();
      router.push(data.redirectTo || '/app/shop');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error');
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
        <SignUpFields
          workspaceType={workspaceType}
          setWorkspaceType={setWorkspaceType}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          businessName={businessName}
          setBusinessName={setBusinessName}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create Account <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

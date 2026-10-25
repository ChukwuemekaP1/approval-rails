'use client';

import React from 'react';
import { Building2, User } from 'lucide-react';

interface Props {
  workspaceType: 'PERSONAL' | 'BUSINESS';
  setWorkspaceType: (type: 'PERSONAL' | 'BUSINESS') => void;
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  businessName: string;
  setBusinessName: (val: string) => void;
}

export function SignUpFields(props: Props) {
  const {
    workspaceType,
    setWorkspaceType,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    businessName,
    setBusinessName,
  } = props;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
        <button
          type="button"
          onClick={() => setWorkspaceType('PERSONAL')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 ${
            workspaceType === 'PERSONAL' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''
          }`}
        >
          <User className="w-3.5 h-3.5" /> Personal
        </button>
        <button
          type="button"
          onClick={() => setWorkspaceType('BUSINESS')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 ${
            workspaceType === 'BUSINESS' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Business
        </button>
      </div>

      <div>
        <label className="font-medium text-slate-700 dark:text-slate-300">Full Name</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Alex Morgan"
          className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>

      <div>
        <label className="font-medium text-slate-700 dark:text-slate-300">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex@company.com"
          className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>

      {workspaceType === 'BUSINESS' && (
        <div>
          <label className="font-medium text-slate-700 dark:text-slate-300">Company Name</label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Acme Corp"
            className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
        </div>
      )}

      <div>
        <label className="font-medium text-slate-700 dark:text-slate-300">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>

      <div>
        <label className="font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>
    </>
  );
}

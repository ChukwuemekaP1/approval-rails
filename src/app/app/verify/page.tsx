'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, FileCheck, Upload, ArrowLeft } from 'lucide-react';
import { verifyEvidenceBundle } from '@/domain/ledger/verifier';
import { VerificationResult } from '@/domain/ledger/types';

export default function VerifyEvidencePage() {
  const [jsonText, setJsonText] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleVerify = async (text: string) => {
    if (!text.trim()) return;
    setIsVerifying(true);
    try {
      const parsed = JSON.parse(text);
      const target = parsed.bundle || parsed;
      const res = await verifyEvidenceBundle(target);
      setResult(res);
    } catch (err: any) {
      setResult({
        valid: false,
        reasonCode: 'INVALID_STRUCTURE',
        error: `JSON parsing error: ${err.message}`,
        verifiedCount: 0,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setJsonText(content);
      handleVerify(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <Link href="/app/transactions" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to App
        </Link>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Offline Evidence Verifier</h1>
        <p className="text-xs text-gray-500 mt-1">
          Verify cryptographic integrity, hash chains, and canonical ordering without trusting any remote server or database.
        </p>
      </div>

      <div className="p-6 bg-white dark:bg-gray-900 border rounded-2xl shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Upload Evidence Bundle (.json)
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">
              <Upload className="w-3.5 h-3.5" /> Choose File
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="text-xs text-gray-500">{fileName || 'No file selected'}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Or Paste Evidence JSON
          </label>
          <textarea
            rows={5}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='{"schemaVersion": "1.0.0", "events": [...]}'
            className="w-full p-3 font-mono text-xs border rounded-xl bg-gray-50 dark:bg-gray-950 focus:outline-none"
          />
        </div>

        <button
          onClick={() => handleVerify(jsonText)}
          disabled={isVerifying || !jsonText.trim()}
          className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl disabled:opacity-50"
        >
          {isVerifying ? 'Running Cryptographic Verification...' : 'Verify Cryptographic Integrity'}
        </button>
      </div>

      {result && (
        <div className={`p-6 border rounded-2xl ${result.valid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-3">
            {result.valid ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
            )}
            <div className="space-y-1">
              <h3 className={`text-sm font-bold ${result.valid ? 'text-emerald-900' : 'text-red-900'}`}>
                {result.valid ? 'Audit Passed: Hash Chain Pristine' : `Verification Failed: ${result.reasonCode}`}
              </h3>
              <p className={`text-xs ${result.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.valid
                  ? `Successfully validated ${result.verifiedCount} consecutive events across the SHA-256 hash chain.`
                  : result.error}
              </p>
              {result.brokenSequence && (
                <div className="text-xs font-mono font-bold text-red-800">
                  Tamper detected at event sequence #{result.brokenSequence}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

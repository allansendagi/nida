'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { validateNomosContract } from '@/lib/nomos/validate';

export function NomosUploadOnboarding() {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [contract, setContract] = useState<Record<string, unknown> | null>(null);
  const [contractFilename, setContractFilename] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setContract(null);
    setContractFilename(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const validation = validateNomosContract(parsed);
        if (!validation.valid) {
          setParseError(`Contract validation failed: ${validation.errors.join(', ')}`);
          return;
        }
        setContract(parsed);

        // Pre-fill business name from contract if available
        const issuer = (parsed as Record<string, unknown>).issuer as Record<string, unknown> | undefined;
        if (issuer?.display_name && !displayName) {
          setDisplayName(String(issuer.display_name));
        }
      } catch {
        setParseError('Could not parse file — make sure it is valid JSON.');
      }
    };
    reader.readAsText(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contract) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/businesses/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          phone,
          email: email || null,
          crNumber,
          nomosContract: contract,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Alert>
        Application submitted successfully! Our team will review your profile and get back to you soon.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && <Alert variant="destructive">{submitError}</Alert>}

      {/* File upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload .nomos Contract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors ${
              contract
                ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".nomos,.json"
              onChange={handleFileChange}
              className="sr-only"
            />
            {contract ? (
              <>
                <span className="text-3xl mb-2">✅</span>
                <p className="font-medium text-green-700 dark:text-green-400">{contractFilename}</p>
                <p className="text-sm text-green-600/70 mt-1">Contract validated successfully</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setContract(null); setContractFilename(''); }}
                  className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <span className="text-3xl mb-2">📄</span>
                <p className="font-medium text-gray-700">Drop your .nomos file here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
              </>
            )}
          </div>

          {parseError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {parseError}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Don&apos;t have a .nomos file?{' '}
            <a
              href="/sample.nomos"
              download
              className="underline hover:text-foreground"
            >
              Download a sample
            </a>{' '}
            to get started.
          </p>
        </CardContent>
      </Card>

      {/* Basic info — always required */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A few details we need for your account — not in the contract.
          </p>

          <div className="space-y-2">
            <Label htmlFor="displayName">Business Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Al Falah AC Services"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+974 5555 5555"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="business@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crNumber">CR Number *</Label>
            <Input
              id="crNumber"
              value={crNumber}
              onChange={(e) => setCrNumber(e.target.value)}
              placeholder="123456789"
              required
            />
            <p className="text-xs text-muted-foreground">
              Commercial Registration number from the Ministry of Commerce
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={loading || !contract || !displayName || !phone || !crNumber}
        className="w-full"
      >
        {loading ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  );
}

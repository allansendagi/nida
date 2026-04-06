'use client';

import { useState, useRef } from 'react';

interface NomosManagerProps {
  hasContract: boolean;
  businessName: string;
}

export function NomosManager({ hasContract, businessName }: NomosManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/business/nomos', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.errors?.length ? data.errors.join(', ') : data.error;
        throw new Error(msg || 'Upload failed');
      }

      setSuccess('Contract updated successfully');
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleDownload() {
    window.location.href = '/api/business/nomos';
  }

  const filename = `${businessName.toLowerCase().replace(/\s+/g, '_')}.nomos`;

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📄</span>
        <div>
          <p className="font-medium text-gray-900">NOMOS Contract</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Your machine-readable service contract powers AI matching. Upload a{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">.nomos</code> file to update it.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {hasContract && (
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download {filename}
          </button>
        )}

        <label className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept=".nomos,.json"
            onChange={handleUpload}
            disabled={uploading}
            className="sr-only"
          />
          <span
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
              hasContract
                ? 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                : 'text-white bg-blue-600 hover:bg-blue-700'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
            </svg>
            {uploading ? 'Uploading...' : hasContract ? 'Replace contract' : 'Upload .nomos file'}
          </span>
        </label>
      </div>

      {!hasContract && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          No contract on file — your profile uses basic category/zone matching. Upload a .nomos contract for precise AI matching and priority leads.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
    </div>
  );
}

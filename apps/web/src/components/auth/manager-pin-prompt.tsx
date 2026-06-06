'use client';

import { FormEvent, useState } from 'react';

interface ManagerPinPromptProps {
  accessToken?: string;
  onAuthorized: () => void;
  onCancel?: () => void;
}

export function ManagerPinPrompt({ accessToken, onAuthorized, onCancel }: ManagerPinPromptProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch('/api/auth/manager-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ pin }),
    });

    setLoading(false);

    if (!response.ok) {
      setError('Manager authorization failed');
      return;
    }

    setPin('');
    onAuthorized();
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h2 className="text-sm font-semibold text-amber-950">Manager authorization required</h2>
      <p className="mt-1 text-sm text-amber-900">
        Enter an owner or manager PIN to continue this restricted action.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-700"
          placeholder="Manager PIN"
          minLength={4}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Checking...' : 'Authorize'}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-950"
          >
            Cancel
          </button>
        ) : null}
      </form>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

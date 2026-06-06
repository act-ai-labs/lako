'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!response.ok) {
      setError('Invalid username or password');
      return;
    }

    const next = searchParams.get('next') ?? '/pos';
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-57px)] max-w-md items-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold">Sign in to LAKO POS</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Use your cashier, manager, or owner credentials to continue.
        </p>

        <label className="mt-6 block text-sm font-medium text-zinc-700" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          autoComplete="username"
          required
        />

        <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          autoComplete="current-password"
          required
        />

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-sm text-zinc-600">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}

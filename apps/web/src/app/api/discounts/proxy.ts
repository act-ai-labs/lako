import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function discountRequest(path = '', init?: RequestInit) {
  const token = (await cookies()).get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/discounts${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  return NextResponse.json(payload, { status: response.status });
}

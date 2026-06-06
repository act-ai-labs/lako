import { NextResponse } from 'next/server';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    role: 'owner' | 'manager' | 'cashier';
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const apiUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const apiResponse = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!apiResponse.ok) {
    return NextResponse.json({ message: 'Invalid username or password' }, { status: apiResponse.status });
  }

  const payload = (await apiResponse.json()) as LoginResponse;
  const response = NextResponse.json({
    user: payload.user,
    accessToken: payload.accessToken,
  });

  response.cookies.set('access_token', payload.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 15,
  });
  response.cookies.set('refresh_token', payload.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set('user_role', payload.user.role, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

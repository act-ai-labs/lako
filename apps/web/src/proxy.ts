import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ROUTES = ['/admin'];
const REPORT_ROUTES = ['/reports'];
const AUTHENTICATED_ROUTES = [
  '/pos',
  '/gcash',
  '/inventory',
  '/suppliers',
  '/expenses',
  ...ADMIN_ROUTES,
  ...REPORT_ROUTES,
];

function isPathMatch(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  const role = request.cookies.get('user_role')?.value;

  if (isPathMatch(pathname, AUTHENTICATED_ROUTES) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (role === 'cashier' && isPathMatch(pathname, [...ADMIN_ROUTES, ...REPORT_ROUTES])) {
    return NextResponse.redirect(new URL('/pos', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/pos/:path*',
    '/gcash/:path*',
    '/inventory/:path*',
    '/suppliers/:path*',
    '/expenses/:path*',
    '/reports/:path*',
    '/admin/:path*',
  ],
};

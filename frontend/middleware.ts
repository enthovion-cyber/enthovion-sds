import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const PUBLIC_PATHS = [
  '/',                  // <-- Added Home Page as a public path!
  '/login',
  '/register',
  '/forgot-password',
  '/verify-otp',
  '/reset-password',
  '/verify-email'
];

// Paths that logged-in users should NOT be able to visit (auth forms)
const AUTH_ONLY_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/verify-otp',
  '/reset-password',
  '/verify-email'
];

const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'ar'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isRSCRequest = request.headers.get('RSC') === '1';

  // 1. Skip static files, Next.js internal routes, and API routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    /\.[^/]+$/.test(pathname) 
  ) {
    return NextResponse.next();
  }

  // Helper for RSC-safe redirects
  const safeRedirect = (url: URL) => {
    const response = NextResponse.redirect(url);
    if (isRSCRequest) {
      response.headers.set('x-nextjs-redirect', url.pathname + url.search);
    }
    return response;
  };

  // Extract locale from path
  const pathnameLocale = SUPPORTED_LOCALES.find(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  );

  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const preferredLocale = SUPPORTED_LOCALES.includes(cookieLocale || '') 
    ? cookieLocale 
    : DEFAULT_LOCALE;

  // 2. Redirect bare root (`/`) to localized home page (`/en` or `/ar`)
  if (pathname === '/') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${preferredLocale}`; // Redirects to home page instead of dashboard
    return safeRedirect(redirectUrl);
  }

  // 3. If missing locale prefix, attach preferred locale
  if (!pathnameLocale) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${preferredLocale}${pathname}`;
    return safeRedirect(redirectUrl);
  }

  const locale = pathnameLocale;
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // 4. Check if current path is public
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathWithoutLocale === p || (p !== '/' && pathWithoutLocale.startsWith(`${p}/`))
  );

  const isAuthOnlyPath = AUTH_ONLY_PATHS.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );

  const token = request.cookies.get('accessToken')?.value;

  // 5. Unauthenticated user trying to access a protected route (e.g. /dashboard)
  if (!isPublicPath && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    return NextResponse.redirect(loginUrl);
  }

  // 6. Authenticated user trying to access auth routes (e.g., /login or /register)
  if (isAuthOnlyPath && token) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = `/${locale}/dashboard`;
    dashboardUrl.searchParams.forEach((_, key) => dashboardUrl.searchParams.delete(key));
    return safeRedirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
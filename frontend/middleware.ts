import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
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

  // 1. Skip static files and internal Next.js paths
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    /\.[^/]+$/.test(pathname) 
  ) {
    return NextResponse.next();
  }

  // Helper to handle RSC-safe redirects
  const safeRedirect = (url: URL) => {
    const response = NextResponse.redirect(url);
    if (isRSCRequest) {
      // This header tells the Next.js client-side router to redirect 
      // instead of failing the fetch payload.
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

  // 2. Redirect root to dashboard
  if (pathname === '/') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${preferredLocale}/dashboard`;
    return safeRedirect(redirectUrl);
  }

  // 3. If no locale prefix, add the default/preferred
  if (!pathnameLocale) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${preferredLocale}${pathname}`;
    return safeRedirect(redirectUrl);
  }

  const locale = pathnameLocale;
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // 4. Stricter Public Path Matching
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );

const token = request.cookies.get('accessToken')?.value;

if (!isPublicPath && !token) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `/${locale}/login`;
  return NextResponse.redirect(loginUrl);
}

  // 6. Authenticated user trying to access public auth route (e.g., login)
  if (isPublicPath && token) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = `/${locale}/dashboard`;
    // Clear search params
    dashboardUrl.searchParams.forEach((_, key) => dashboardUrl.searchParams.delete(key));
    return safeRedirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Enhanced matcher to exclude all files with extensions
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
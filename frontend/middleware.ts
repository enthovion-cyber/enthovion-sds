import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Tell Next.js to use Node.js runtime instead of Edge
export const runtime = 'nodejs';

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

  // 3. If no locale prefix, add default/preferred
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

  // 5. Authenticated user trying to access public auth route (e.g., login)
  if (isPublicPath && token) {
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
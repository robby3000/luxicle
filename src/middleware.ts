import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types'; // Ensure this path is correct

// Helper function to create a Supabase client for middleware
function createSupabaseMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          // The `set` method was called from a Server Component.
          // This cookie will be set on `res` system header, ResponseHeader.
          // It will be sent back to the browser on the initial HTML response.
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
}

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/dashboard']; // Add any routes you want to protect

  // If user is not authenticated and trying to access a protected route
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('next', pathname); // Optionally redirect back after login
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access login/register, redirect to dashboard or home
  if (session && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard'; // Or '/' for homepage
    return NextResponse.redirect(redirectUrl);
  }
  
  // Refresh session if expired - important for server-side rendering
  // This is generally handled by Supabase client, but an explicit getSession can help ensure it's fresh.
  // The getSession call above already does this.

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (publicly accessible root, if any specific public files are there)
     * - /auth/callback (OAuth callback needs to be public)
     * - /auth/confirm (Email confirm needs to be public)
     * Feel free to adjust this matcher to fit your needs.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth/callback|auth/confirm).*)',
  ],
};

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

  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get the current URL and pathname
  const url = new URL(req.url);
  const { pathname } = url;
  
  // Define protected routes that require authentication
  const isProtectedRoute = [
    '/profile',
    '/dashboard',
    '/challenges/create'
  ].some(route => pathname.startsWith(route));
  
  // Define auth routes that should redirect logged in users away
  const isAuthRoute = [
    '/login',
    '/register'
  ].some(route => pathname === route);
  
  // If user is on a protected route and not logged in, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // If user is logged in and trying to access login/register pages, redirect to home
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

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

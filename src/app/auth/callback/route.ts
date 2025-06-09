import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// This route handles the callback from Supabase after OAuth authentication.
// Supabase exchanges the code for a session in its own flow, and the client library
// picks up the session. This route primarily redirects the user.
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/'; // Default redirect to homepage

  if (code) {
    // Although createSupabaseServerClient() can be used here to potentially exchange the code,
    // Supabase's client-side library or middleware typically handles session establishment
    // when the user is redirected back to the app. 
    // For server-side code exchange (if needed, though often not for simple redirects):
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore as any);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Supabase OAuth code exchange error:', error);
      // Redirect to an error page or show an error message
      // For simplicity, redirecting to login with an error query param
      const redirectUrl = requestUrl.origin + '/auth/login?error=OAuth+authentication+failed';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect to the 'next' URL (e.g., /dashboard) or the default path
  const redirectUrl = requestUrl.origin + next;
  return NextResponse.redirect(redirectUrl);
}

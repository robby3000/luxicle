import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

// This route handles email confirmation links.
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') || '/'; // Default redirect after confirmation

  if (!token_hash || !type) {
    console.error('Missing token_hash or type for email confirmation.');
    // Redirect to an error page or show an error message
    const redirectUrl = requestUrl.origin + '/auth/login?error=Invalid+confirmation+link';
    return NextResponse.redirect(redirectUrl);
  }

  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore as any);

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  });

  if (error) {
    console.error('Supabase email confirmation error:', error.message);
    // Redirect to an error page or show an error message
    const redirectUrl = requestUrl.origin + `/auth/login?error=${encodeURIComponent(error.message || 'Email+confirmation+failed')}`;
    return NextResponse.redirect(redirectUrl);
  }

  // Email confirmed successfully. 
  // Supabase client should automatically pick up the session if the user was new and this was a signup confirmation.
  // Redirect to a success page, login page, or the 'next' URL.
  // For example, redirect to login page with a success message:
  let redirectPath = requestUrl.origin;
  if (type === 'signup') {
    redirectPath += '/auth/login?message=Email+confirmed+successfully.+Please+log+in.';
  } else {
    // For other OTP types like 'recovery', 'magiclink', you might redirect differently
    redirectPath += next; // Or a specific page like '/account-recovered'
  }
  
  return NextResponse.redirect(redirectPath);
}

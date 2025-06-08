import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  console.log('API: /api/auth/login - Processing login request');
  
  // Get the request body with email and password
  const body = await request.json();
  const { email, password } = body;

  // Validate the request
  if (!email || !password) {
    console.log('API: Login validation failed - missing email or password');
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  try {
    // Get the cookie store and ensure it's properly awaited
    // The type error occurs because cookies() might return a Promise in Route Handlers
    const cookieStore = await cookies();
    
    // Now create the server client with the awaited cookie store
    const supabase = createSupabaseServerClient(cookieStore);

    console.log(`API: Attempting login for email: ${email}`);
    
    // Sign in with password - this method should set the auth cookies
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If there was an error during sign in
    if (error) {
      console.error('API: Login error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If sign in was successful but no user or session was returned
    if (!data?.user || !data?.session) {
      console.error('API: Login error - Missing user or session data after successful login');
      return NextResponse.json(
        { error: 'Authentication failed. Please try again.' },
        { status: 400 }
      );
    }
    
    console.log('API: Login successful for user:', data.user.email);
    console.log('API: Session created with access token length:', data.session.access_token.length);
    
    // Create response with session information for the client
    const response = NextResponse.json({
      user: data.user,
      session: {
        access_token: data.session.access_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        refresh_token: data.session.refresh_token,
      },
      message: 'Login successful'
    });
    
    return response;
  } catch (serverError) {
    console.error('API: Server error during login:', serverError);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

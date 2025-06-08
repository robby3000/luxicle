import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body: Not JSON' }, { status: 400 });
  }

  const { email, password } = requestData;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase signInWithPassword error:', error);
    // Provide a more generic error message to the client for security
    // Common errors: Invalid login credentials
    return NextResponse.json(
      { error: 'Invalid login credentials. Please check your email and password.' , details: error.message }, 
      { status: 401 } // Unauthorized
    );
  }

  // On successful login, Supabase sets the session cookie automatically via the server client.
  // The client-side Supabase instance will pick up this session.
  return NextResponse.json(
    {
      message: 'Login successful',
      user: data.user,
      session: data.session,
    },
    { status: 200 }
  );
}

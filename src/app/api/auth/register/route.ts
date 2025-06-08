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

  const { email, password, username } = requestData;

  if (!email || !password || !username) {
    return NextResponse.json(
      { error: 'Email, password, and username are required' },
      { status: 400 }
    );
  }

  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be a string and at least 8 characters long' },
      { status: 400 }
    );
  }

  if (typeof username !== 'string' || username.length < 3) {
    return NextResponse.json(
      { error: 'Username must be a string and at least 3 characters long' },
      { status: 400 }
    );
  }

  // Basic email validation (can be more sophisticated)
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
        // You can add other initial user data here if needed by your public.users table trigger
      },
      // Optional: Email confirmation redirect URL. If not set, Supabase uses default.
      // emailRedirectTo: `${new URL(request.url).origin}/auth/confirm`,
    },
  });

  if (error) {
    console.error('Supabase signUp error:', error);
    // Provide a more generic error message to the client for security
    let errorMessage = 'Registration failed. Please try again.';
    let statusCode = 500;

    // Check for specific common errors to provide better client feedback if safe
    if (error.message.includes('User already registered')) {
        errorMessage = 'This email is already registered.';
        statusCode = 409; // Conflict
    } else if (error.message.includes('Password should be at least 6 characters')) {
        // This check is also done above, but Supabase might have stricter/different rules
        errorMessage = 'Password is too weak or does not meet requirements.';
        statusCode = 400;
    }
    
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
  }

  // According to Supabase docs, if email confirmation is enabled (default for new projects):
  // data.user will contain the user object, but data.session will be null until confirmed.
  // If email confirmation is disabled, data.session will contain the session.
  if (data.user && !data.session) {
    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email to confirm your account.',
        user: {
          id: data.user.id,
          email: data.user.email,
          // Do not return sensitive details like confirmation tokens here
        }
      },
      { status: 201 }
    );
  } else if (data.user && data.session) {
    // This case handles scenarios where email confirmation might be disabled or auto-confirmed
    return NextResponse.json(
      {
        message: 'Registration successful and user logged in.',
        user: {
            id: data.user.id,
            email: data.user.email,
        },
        session: data.session, // You might choose to return the session or not
      },
      { status: 201 }
    );
  }

  // Fallback for unexpected scenarios, though Supabase usually returns a user or an error.
  return NextResponse.json({ message: 'Registration process initiated.' }, { status: 202 });
}

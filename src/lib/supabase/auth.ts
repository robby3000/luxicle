import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import type {
  AuthError,
  AuthResponse,
  OAuthResponse,
  Session,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  User,
  Provider,
} from '@supabase/supabase-js';

// Client-side Supabase instance (for use in browser/client components)
const supabaseBrowserClient = createSupabaseBrowserClient();

/**
 * Signs up a new user with email and password.
 * Optionally accepts additional user metadata (e.g., username).
 */
export async function signUpWithEmail(
  credentials: SignUpWithPasswordCredentials & { options?: { data?: { username?: string; [key: string]: any } } }
): Promise<AuthResponse> {
  return supabaseBrowserClient.auth.signUp(credentials);
}

/**
 * Signs in an existing user with email and password.
 */
export async function signInWithEmail(
  credentials: SignInWithPasswordCredentials
): Promise<AuthResponse> {
  return supabaseBrowserClient.auth.signInWithPassword(credentials);
}

/**
 * Signs in a user with an OAuth provider (e.g., 'google', 'github').
 */
export async function signInWithOAuth(
  provider: Provider
): Promise<OAuthResponse> {
  return supabaseBrowserClient.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`, // Default callback URL
    },
  });
}

/**
 * Signs out the current user.
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  return supabaseBrowserClient.auth.signOut();
}

/**
 * Gets the current authenticated user (client-side).
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabaseBrowserClient.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }
  return data.user;
}

/**
 * Gets the current session (client-side).
 */
export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabaseBrowserClient.auth.getSession();
  if (error) {
    console.error('Error getting current session:', error.message);
    return null;
  }
  return data.session;
}

// --- Server-side Auth Helpers ---

/**
 * Gets the current authenticated user (server-side, e.g., in Route Handlers or Server Components).
 * Requires cookieStore from Next.js 'next/headers'.
 */
export async function getCurrentUserServer(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    // It's common for this to error if no user is logged in, so might not always be a console error.
    // console.error('Server: Error getting current user:', error.message);
    return null;
  }
  return data.user;
}

/**
 * Gets the current session (server-side, e.g., in Route Handlers or Server Components).
 * Requires cookieStore from Next.js 'next/headers'.
 */
export async function getCurrentSessionServer(): Promise<Session | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    // console.error('Server: Error getting current session:', error.message);
    return null;
  }
  return data.session;
}

/**
 * Subscribes to authentication state changes.
 * @param callback Function to call when auth state changes.
 * @returns Subscription object with an unsubscribe method.
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const { data: authListener } = supabaseBrowserClient.auth.onAuthStateChange(callback);
  return authListener;
}

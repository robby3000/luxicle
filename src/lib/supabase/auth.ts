import { createSupabaseBrowserClient } from '@/lib/supabase/client';
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
 * First tries to get the user from the session, then falls back to getUser()
 * This provides better reliability during initial page loads after authentication.
 */
export async function getCurrentUser(): Promise<User | null> {
  // First try to get the session, which may be more reliable immediately after auth state changes
  const { data: sessionData, error: sessionError } = await supabaseBrowserClient.auth.getSession();
  
  // If we have a valid session with a user, return that user
  if (sessionData?.session?.user) {
    return sessionData.session.user;
  }
  
  // If there was an error getting the session or no user was found, try getUser() as fallback
  if (sessionError) {
    console.log('Session retrieval error, falling back to getUser():', sessionError.message);
  }
  
  // Fall back to getUser()
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

import { useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Corrected import
import { useAuthStore } from '@/stores/authStore';
import { AuthError } from '@supabase/supabase-js';
import type { User, Session, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, OAuthResponse, Provider, AuthChangeEvent } from '@supabase/supabase-js';

const supabase = createSupabaseBrowserClient(); // Initialize client

export const useAuth = () => {
  const {
    user,
    session,
    isLoading,
    error,
    setUserAndSession,
    clearAuth,
    setLoading,
    setError,
  } = useAuthStore();

  // Subscribe to auth state changes
  useEffect(() => {
    setLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        const currentUser = session?.user ?? null;
        setUserAndSession(currentUser, session);
        setLoading(false);
      }
    );

    // Check initial session
    const checkInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error: initialError } = await supabase.auth.getSession();
        if (initialError) throw initialError;
        if (initialSession) {
          setUserAndSession(initialSession.user, initialSession);
        } else {
          clearAuth();
        }
      } catch (e: any) {
        setError(e);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [setUserAndSession, clearAuth, setLoading, setError]);

  const signInWithEmail = useCallback(
    async (credentials: SignInWithPasswordCredentials) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword(credentials);
        if (signInError) throw signInError;
        if (data.user && data.session) {
          setUserAndSession(data.user, data.session);
        } else {
          // Should not happen if no error, but good to handle
          throw new Error('Sign in successful but no user or session returned.');
        }
        return { user: data.user, session: data.session, error: null };
      } catch (e: any) {
        setError(e);
        clearAuth(); // Clear auth state on error
        return { user: null, session: null, error: e };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUserAndSession, clearAuth]
  );

  const signUpWithEmail = useCallback(
    async (credentials: SignUpWithPasswordCredentials) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: signUpError } = await supabase.auth.signUp(credentials);
        if (signUpError) throw signUpError;
        // Supabase signUp might return a user/session if email confirmation is disabled,
        // or just a user if confirmation is required.
        // For now, we assume successful signUp means user needs to confirm email,
        // so we don't automatically set user/session here unless explicitly returned and active.
        // The onAuthStateChange listener will pick up the user once confirmed and logged in.
        if (data.user && data.session) { // User is active immediately (e.g. auto-confirm enabled)
            setUserAndSession(data.user, data.session);
        } else if (data.user && !data.session) { // User created, awaiting confirmation
            // Optionally set user if you want to show "pending confirmation" state
            // setUserAndSession(data.user, null); 
        }
        return { user: data.user, session: data.session, error: null };
      } catch (e: any) {
        setError(e);
        return { user: null, session: null, error: e };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUserAndSession]
  );

  const signInWithOAuth = useCallback(
    async (provider: Provider): Promise<OAuthResponse> => {
      setLoading(true);
      setError(null);
      try {
        const result = await supabase.auth.signInWithOAuth({ provider });
        if (result.error) throw result.error;
        // OAuth redirects, onAuthStateChange will handle user/session update upon successful login
        return result;
      } catch (caughtError: unknown) {
        let errorToSetAndReturn: AuthError;
        if (caughtError instanceof AuthError) {
          errorToSetAndReturn = caughtError;
        } else if (caughtError instanceof Error) {
          // Create a new AuthError from a generic Error
          errorToSetAndReturn = new AuthError(caughtError.message);
        } else {
          errorToSetAndReturn = new AuthError('An unknown OAuth error occurred.');
        }
        setError(errorToSetAndReturn);
        setLoading(false); // Reset loading as redirect might not happen on error
        return { data: { provider, url: null }, error: errorToSetAndReturn };
      }
      // setLoading(false) is not called on success path as page will redirect
    },
    [setLoading, setError]
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      clearAuth(); // onAuthStateChange will also fire, but good to be explicit
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearAuth]);
  
  const sendPasswordResetEmail = useCallback(
    async (email: string, redirectTo?: string) => {
      setLoading(true);
      setError(null);
      try {
        const options = redirectTo ? { redirectTo } : {};
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, options);
        if (resetError) throw resetError;
        // Handle success (e.g., show a message to the user)
      } catch (e: any) {
        setError(e);
        throw e; // Re-throw to allow form to handle it
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  return {
    user,
    session,
    isLoading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    sendPasswordResetEmail,
  };
};

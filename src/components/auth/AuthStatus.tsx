'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/supabase/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // We create the client inside the component to ensure it's always fresh
  // This avoids stale closures with the Supabase client
  const getSupabaseClient = () => createSupabaseBrowserClient();

  // Initialize and load auth state
  useEffect(() => {
    console.log('AuthStatus: Initializing auth state monitoring');

    const loadUserSession = async () => {
      try {
        // Get a fresh client instance
        const supabase = getSupabaseClient();
        
        // First retrieve the session
        const { data } = await supabase.auth.getSession();
        console.log('AuthStatus: Initial session check:', !!data?.session);
        
        if (data?.session?.user) {
          console.log('AuthStatus: User found in session');
          setUser(data.session.user);
        }
      } catch (error) {
        console.error('AuthStatus: Error loading initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial session load
    loadUserSession();

    // Set up real-time listener for auth state changes
    const supabase = getSupabaseClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`AuthStatus: Auth state changed - Event: ${event}`);
      
      // Update user state based on session
      if (session?.user) {
        console.log('AuthStatus: Setting user from auth change event');
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthStatus: User signed out, clearing user state');
        setUser(null);
        // For sign out, do a hard refresh to ensure clean state
        window.location.reload();
      }
    });

    // Clean up subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    console.log('AuthStatus: Signing out...');
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      
      // We'll let the auth state listener handle the UI update
      // The onAuthStateChange will detect SIGNED_OUT and clear user state
      console.log('AuthStatus: Sign out API call successful');
    } catch (error) {
      console.error('AuthStatus: Error during sign out:', error);
    }
  };

  // When loading, show a simple loading state
  if (loading) {
    return <div className="h-10 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>;
  }

  // Render based on authentication state
  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      {user ? (
        <>
          <span className="hidden truncate text-sm text-gray-700 dark:text-gray-300 sm:inline">
            {user.user_metadata?.username || user.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/auth/register">Register</Link>
          </Button>
        </>
      )}
    </div>
  );
}

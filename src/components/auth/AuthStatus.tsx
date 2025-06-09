'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthStatus() {
  // Initialize Supabase client once
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('AuthStatus: Initializing auth state monitoring');

    const loadUserSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log('AuthStatus: Initial session check:', !!data?.session);

        if (data?.session?.user) {
          console.log('AuthStatus: User found in session');
          setUser(data.session.user);
        } else {
          console.log('AuthStatus: No user found in session');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthStatus: Error loading initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      console.log(`AuthStatus: Auth state changed - Event: ${event}`);

      if (session?.user) {
        console.log('AuthStatus: Setting user from auth change event');
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthStatus: User signed out, clearing user state');
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router]); 

  const handleSignOut = async () => {
    console.log('AuthStatus: Signing out...');
    try {
      await supabase.auth.signOut();
      console.log('AuthStatus: Sign out API call successful');
      // The onAuthStateChange listener will handle UI updates
    } catch (error) {
      console.error('AuthStatus: Error during sign out:', error);
    }
  };

  if (loading) {
    return <div className="h-10 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>;
  }

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
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/register">Register</Link>
          </Button>
        </>
      )}
    </div>
  );
}

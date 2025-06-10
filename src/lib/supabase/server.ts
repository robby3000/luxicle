import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types'; // We'll create this types file soon
import type { User, Session } from '@supabase/supabase-js';

// Ensure this function is only called in server-side contexts where cookies() resolves synchronously.
// The cookieStoreInstance will be the resolved object from `await cookies()` in Route Handlers.
export function createSupabaseServerClient(cookieStoreInstance: Awaited<ReturnType<typeof cookies>>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set. Server client cannot be created.');
  }
  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Server client cannot be created.');
  }
  if (!cookieStoreInstance) {
    throw new Error('cookieStoreInstance was not provided to createSupabaseServerClient. This is a critical error in how the function is called.');
  }
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          if (typeof cookieStoreInstance?.get !== 'function') {
            console.error('cookieStoreInstance.get is not a function or cookieStoreInstance is undefined. Name:', name);
            // Potentially throw or return a more specific error/value if this state is reached
            // This indicates a fundamental problem with cookieStoreInstance passed or its type.
            return undefined; 
          }
          return cookieStoreInstance.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            if (typeof cookieStoreInstance?.set !== 'function') {
              console.error('cookieStoreInstance.set is not a function or cookieStoreInstance is undefined. Name:', name);
              return;
            }
            
            // Safely attempt to set the cookie, but catch any errors from the Next.js API
            // This ensures we gracefully handle cookie operations in various contexts
            try {
              cookieStoreInstance.set(name, value, options);
            } catch (err: any) {
              // If the error is related to cookies being immutable, log a helpful message
              if (err?.message?.includes('immutable')) {
                console.warn(`Cannot set cookie '${name}' - cookies are immutable in this context. Use Server Actions or Route Handlers to modify cookies.`);
              } else {
                throw err; // Re-throw unexpected errors
              }
            }
          } catch (error) {
            console.error(`Error setting cookie '${name}':`, error);
            // Continue execution rather than crashing
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            if (typeof cookieStoreInstance?.delete !== 'function') {
              console.error('cookieStoreInstance.delete is not a function or cookieStoreInstance is undefined. Name:', name);
              return;
            }
            
            // Safely attempt to delete the cookie, but catch any errors from the Next.js API
            try {
              // Adapt to Next.js ResponseCookies delete method which can take an object with name and options
              cookieStoreInstance.delete({ name, ...options });
            } catch (err: any) {
              // If the error is related to cookies being immutable, log a helpful message
              if (err?.message?.includes('immutable')) {
                console.warn(`Cannot delete cookie '${name}' - cookies are immutable in this context. Use Server Actions or Route Handlers to modify cookies.`);
              } else {
                throw err; // Re-throw unexpected errors
              }
            }
          } catch (error) {
            console.error(`Error removing cookie '${name}':`, error);
            // Continue execution rather than crashing
          }
        },
      },
    }
  );
}


// --- Server-side Auth Helper Functions ---

/**
 * Gets the current authenticated user (server-side, e.g., in Route Handlers or Server Components).
 * Optionally accepts a pre-created Supabase server client.
 */
export async function getCurrentUserServer(
  resolvedCookieStore: Awaited<ReturnType<typeof cookies>>,
  client?: ReturnType<typeof createSupabaseServerClient>
): Promise<User | null> {
  const supabase = client || createSupabaseServerClient(resolvedCookieStore);
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    // It's common for this to error if no user is logged in.
    return null;
  }
  return data.user;
}

/**
 * Gets the current session (server-side, e.g., in Route Handlers or Server Components).
 * Optionally accepts a pre-created Supabase server client.
 */
export async function getCurrentSessionServer(
  resolvedCookieStore: Awaited<ReturnType<typeof cookies>>,
  client?: ReturnType<typeof createSupabaseServerClient>
): Promise<Session | null> {
  const supabase = client || createSupabaseServerClient(resolvedCookieStore);
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return null;
  }
  return data.session;
}

// Utility to create a server client with admin privileges (uses SERVICE_ROLE_KEY)
// Handle with extreme care and use only when RLS bypass is absolutely necessary.
export function createSupabaseAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Admin client cannot be created.');
  }
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      // For admin client, cookie handling might not be necessary or desired in the same way.
      // If you need to impersonate a user or manage user sessions via admin client,
      // refer to Supabase documentation for specific patterns.
      // auth: {
      //   autoRefreshToken: false,
      //   persistSession: false,
      // }
    }
  );
}

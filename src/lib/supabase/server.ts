import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types'; // We'll create this types file soon

export function createSupabaseServerClient(cookieStore?: ReturnType<typeof cookies>) {
  const store = cookieStore || cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          store.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          store.delete(name, options);
        },
      },
    }
  );
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
      cookies: {},
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

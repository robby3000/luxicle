'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types'; // We'll create this types file soon

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

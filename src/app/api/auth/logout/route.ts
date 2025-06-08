import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Supabase signOut error:', error);
    return NextResponse.json(
      { error: 'Logout failed. Please try again.', details: error.message }, 
      { status: 500 }
    );
  }

  // Supabase client's signOut method handles cookie invalidation.
  return NextResponse.json(
    { message: 'Logout successful' }, 
    { status: 200 }
  );
}

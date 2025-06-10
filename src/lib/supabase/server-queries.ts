import { cookies } from 'next/headers';
import { createSupabaseServerClient } from './server';
import type { UserProfile } from './types';

// Define types inline since this is a server-only file
type GetUserProfileParams = {
  userId?: string;
  username?: string;
};

type GetChallengesParams = {
  categoryId?: string;
  tagIds?: string[];
  searchQuery?: string;
  featured?: boolean;
  active?: boolean;
  limit?: number;
  offset?: number;
};

// Server-side functions (for use in Server Components or API routes)
export async function getUserProfileServer({ userId, username }: GetUserProfileParams) {
  // In Next.js App Router, cookies() returns a ReadonlyRequestCookies object, not a Promise
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore as any);
  
  let query = supabase
    .from('users')
    .select(`
      *,
      followers:follows!follower_id(count),
      following:follows!followee_id(count)
    `);
    
  if (userId) {
    query = query.eq('id', userId);
  } else if (username) {
    query = query.eq('username', username);
  } else {
    throw new Error('Either userId or username must be provided');
  }
  
  const { data, error } = await query.single();
  
  if (error) throw error;
  return data;
}

export async function getChallengesServer(params: GetChallengesParams = {}) {
  // In Next.js App Router, cookies() returns a ReadonlyRequestCookies object, not a Promise
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore as any);
  
  // Implementation similar to getChallenges but for server context
  const { categoryId, tagIds, searchQuery, featured, active, limit = 10, offset = 0 } = params;
  
  let query = supabase
    .from('challenges')
    .select(`
      *,
      category:categories(*),
      tags:challenge_tags(tag:tags(*))
    `)
    .order('opens_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  if (featured !== undefined) {
    query = query.eq('is_featured', featured);
  }
  
  if (active) {
    const now = new Date().toISOString();
    query = query
      .lte('opens_at', now)
      .or(`closes_at.gt.${now},closes_at.is.null`);
  }
  
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

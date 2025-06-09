import { createSupabaseBrowserClient } from './client';
import { createSupabaseServerClient } from './server';
import { cookies } from 'next/headers';
import type { Database } from './types';
import type { User as AuthUser } from '@supabase/supabase-js';
import type {
  Category,
  Tag,
  Challenge,
  ChallengeWithRelations,
  Luxicle,
  LuxicleWithRelations,
  User,
  UserWithRelations,
  CreateLuxicleInput,
  UpdateLuxicleInput,
  UpdateUserProfileInput,
  ChallengeFilters
} from '@/types';

// Import SearchParams type as AppSearchParams to avoid conflict
import type { SearchParams as AppSearchParams } from '@/types';

// Types for query functions
type GetUserProfileParams = {
  userId?: string;
  username?: string;
};

type UpdateUserProfileParams = {
  userId: string;
  data: {
    username?: string;
    display_name?: string;
    bio?: string;
    location?: string;
    avatar_url?: string;
    cover_url?: string;
    website_url?: string;
    twitter_handle?: string;
    instagram_handle?: string;
  };
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

type CreateLuxicleParams = {
  userId: string;
  challengeId: string;
  title: string;
  description?: string;
  categoryId?: string;
  tagIds?: string[];
  isPublished?: boolean;
  items: Array<{
    position: number;
    title: string;
    description?: string;
    media_url?: string;
    embed_provider?: string;
    embed_data?: any;
  }>;
};

type UpdateLuxicleParams = {
  luxicleId: string;
  userId: string; // For authorization check
  data: {
    title?: string;
    description?: string;
    categoryId?: string;
    isPublished?: boolean;
  };
};

type SearchParams = {
  query: string;
  limit?: number;
  offset?: number;
};

// User Profile Functions
export async function getUserProfile({ userId, username }: GetUserProfileParams) {
  const supabase = createSupabaseBrowserClient();
  
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

export async function updateUserProfile({ userId, data }: UpdateUserProfileParams) {
  const supabase = createSupabaseBrowserClient();
  
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return updatedUser;
}

// Challenge Functions
export async function getChallenges({
  categoryId,
  tagIds,
  searchQuery,
  featured,
  active,
  limit = 10,
  offset = 0
}: GetChallengesParams = {}) {
  const supabase = createSupabaseBrowserClient();
  
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
  
  // Filter by tags if needed
  if (tagIds && tagIds.length > 0) {
    return data.filter(challenge => {
      const challengeTags = challenge.tags.map((t: any) => t.tag.id);
      return tagIds.some(tagId => challengeTags.includes(tagId));
    });
  }
  
  return data;
}

export async function getChallenge(challengeId: string) {
  const supabase = createSupabaseBrowserClient();
  
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      category:categories(*),
      tags:challenge_tags(tag:tags(*))
    `)
    .eq('id', challengeId)
    .single();
    
  if (error) throw error;
  return data;
}

// Luxicle Functions
export async function createLuxicle({
  userId,
  challengeId,
  title,
  description,
  categoryId,
  tagIds,
  isPublished = true,
  items
}: CreateLuxicleParams) {
  const supabase = createSupabaseBrowserClient();
  
  // Start a transaction
  const { data: luxicle, error: luxicleError } = await supabase
    .from('luxicles')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      title,
      description,
      category_id: categoryId,
      is_published: isPublished
    })
    .select()
    .single();
    
  if (luxicleError) throw luxicleError;
  
  // Insert items
  const luxicleItems = items.map(item => ({
    ...item,
    luxicle_id: luxicle.id
  }));
  
  const { error: itemsError } = await supabase
    .from('luxicle_items')
    .insert(luxicleItems);
    
  if (itemsError) throw itemsError;
  
  // Insert tags if provided
  if (tagIds && tagIds.length > 0) {
    const luxicleTags = tagIds.map(tagId => ({
      luxicle_id: luxicle.id,
      tag_id: tagId
    }));
    
    const { error: tagsError } = await supabase
      .from('luxicle_tags')
      .insert(luxicleTags);
      
    if (tagsError) throw tagsError;
  }
  
  return luxicle;
}

export async function getLuxicle(luxicleId: string) {
  const supabase = createSupabaseBrowserClient();
  
  const { data: luxicle, error: luxicleError } = await supabase
    .from('luxicles')
    .select(`
      *,
      user:users!user_id(*),
      challenge:challenges!challenge_id(*),
      category:categories(*),
      tags:luxicle_tags(tag:tags(*))
    `)
    .eq('id', luxicleId)
    .single();
    
  if (luxicleError) throw luxicleError;
  
  const { data: items, error: itemsError } = await supabase
    .from('luxicle_items')
    .select('*')
    .eq('luxicle_id', luxicleId)
    .order('position');
    
  if (itemsError) throw itemsError;
  
  return { ...luxicle, items };
}

export async function updateLuxicle({
  luxicleId,
  userId,
  data
}: UpdateLuxicleParams) {
  const supabase = createSupabaseBrowserClient();
  
  // First verify ownership
  const { data: luxicle, error: checkError } = await supabase
    .from('luxicles')
    .select('user_id')
    .eq('id', luxicleId)
    .single();
    
  if (checkError) throw checkError;
  
  if (luxicle.user_id !== userId) {
    throw new Error('Unauthorized: You do not own this luxicle');
  }
  
  // Update the luxicle
  const { data: updatedLuxicle, error } = await supabase
    .from('luxicles')
    .update(data)
    .eq('id', luxicleId)
    .select()
    .single();
    
  if (error) throw error;
  return updatedLuxicle;
}

// Search Functions
export async function searchLuxicles({ query, limit = 10, offset = 0 }: SearchParams) {
  const supabase = createSupabaseBrowserClient();
  
  const { data, error } = await supabase
    .from('luxicles')
    .select(`
      *,
      user:users!user_id(id, username, display_name, avatar_url),
      category:categories(*)
    `)
    .textSearch('title', query, {
      type: 'websearch',
      config: 'english'
    })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (error) throw error;
  return data;
}

export async function searchUsers({ query, limit = 10, offset = 0 }: SearchParams) {
  const supabase = createSupabaseBrowserClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .range(offset, offset + limit - 1);
    
  if (error) throw error;
  return data;
}

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

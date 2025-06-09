import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, Challenge, Luxicle, Category, Tag } from './types';

// Assuming your Supabase client is initialized and exported from here
// For client-side, it's usually createBrowserClient
// For server-side/seed scripts, you might use createServerClient or a service role client
// For simplicity, this example will assume a generic SupabaseClient instance is passed or available.

// --- User Profile ---_-
export async function getUserProfile(supabase: SupabaseClient, userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }
  return data;
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error.message);
    return null;
  }
  return data;
}

// --- Challenges ---_-
export async function getChallenges(supabase: SupabaseClient): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select('*, categories(name, slug), challenge_tags(tags(name, slug)))') // Example of joining related data
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching challenges:', error.message);
    return [];
  }
  return data || [];
}

export async function getChallenge(supabase: SupabaseClient, challengeId: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select('*, categories(name, slug), challenge_tags(tags(name, slug)))')
    .eq('id', challengeId)
    .single();

  if (error) {
    console.error('Error fetching challenge:', error.message);
    return null;
  }
  return data;
}

// --- Luxicles ---_-
export async function createLuxicle(
  supabase: SupabaseClient,
  luxicleData: Omit<Luxicle, 'id' | 'created_at' | 'updated_at' | 'view_count'>
): Promise<Luxicle | null> {
  const { data, error } = await supabase
    .from('luxicles')
    .insert(luxicleData)
    .select()
    .single();

  if (error) {
    console.error('Error creating luxicle:', error.message);
    return null;
  }
  return data;
}

export async function getLuxicle(supabase: SupabaseClient, luxicleId: string): Promise<Luxicle | null> {
  const { data, error } = await supabase
    .from('luxicles')
    .select(`
      *,
      users(username, display_name, avatar_url),
      challenges(title),
      categories(name, slug),
      luxicle_tags(tags(name, slug))
    `)
    .eq('id', luxicleId)
    .single();

  if (error) {
    console.error('Error fetching luxicle:', error.message);
    return null;
  }
  return data;
}

export async function updateLuxicle(
  supabase: SupabaseClient,
  luxicleId: string,
  updates: Partial<Luxicle>
): Promise<Luxicle | null> {
  const { data, error } = await supabase
    .from('luxicles')
    .update(updates)
    .eq('id', luxicleId)
    .select()
    .single();

  if (error) {
    console.error('Error updating luxicle:', error.message);
    return null;
  }
  return data;
}

interface LuxicleSearchFilters {
  categoryId?: string;
  tags?: string[]; // Array of tag IDs or names/slugs depending on how you implement search
  userId?: string;
}

export async function searchLuxicles(
  supabase: SupabaseClient,
  query: string,
  filters?: LuxicleSearchFilters
): Promise<Luxicle[]> {
  let queryBuilder = supabase
    .from('luxicles')
    .select(`
      *,
      users(username, display_name, avatar_url),
      challenges(title),
      categories(name, slug),
      luxicle_tags(tags(name, slug))
    `)
    .textSearch('title_description_search_vector', query); // Assuming you have a tsvector column
                                                      // Or use .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

  if (filters?.categoryId) {
    queryBuilder = queryBuilder.eq('category_id', filters.categoryId);
  }
  if (filters?.userId) {
    queryBuilder = queryBuilder.eq('user_id', filters.userId);
  }
  // Tag filtering can be complex, might involve a function or specific join logic
  // if (filters?.tags?.length) {
  //   queryBuilder = queryBuilder.overlaps('tag_ids_array_column', filters.tags); // Example if tags are an array on luxicle
  // }

  const { data, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error searching luxicles:', error.message);
    return [];
  }
  return data || [];
}

// --- Users Search ---_-
export async function searchUsers(supabase: SupabaseClient, query: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    // Using .or for case-insensitive search on multiple fields
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error('Error searching users:', error.message);
    return [];
  }
  return data || [];
}

// --- Categories --- (Useful for seeding and display)
export async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error.message);
    return [];
  }
  return data || [];
}

// --- Tags --- (Useful for seeding and display)
export async function getTags(supabase: SupabaseClient): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tags:', error.message);
    return [];
  }
  return data || [];
}

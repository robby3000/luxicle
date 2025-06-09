// Import types from the lib/supabase/types.ts file
import type { UserProfile } from '../../lib/supabase/types';
import type { Category, Tag, Challenge } from '../../lib/supabase/types';

// Define the core entity types
export type { UserProfile, Category, Tag, Challenge };
export type User = UserProfile;

// Define additional types needed for the application
export interface Luxicle {
  id: string;
  user_id: string;
  challenge_id: string;
  category_id?: string | null;
  title: string;
  description?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LuxicleItem {
  id: string;
  luxicle_id: string;
  position: number;
  title: string;
  description?: string | null;
  media_url?: string | null;
  embed_provider?: string | null;
  embed_data?: any | null;
  created_at: string;
  updated_at: string;
}

// Extended types with relationships
export interface CategoryWithRelations extends Category {}

export interface TagWithRelations extends Tag {}

export interface ChallengeWithRelations extends Omit<Challenge, 'tags'> {
  category?: Category;
  tags?: Array<{
    tag: Tag;
  }> | Tag[];
}

export interface LuxicleWithRelations extends Luxicle {
  user?: User;
  challenge?: Challenge;
  category?: Category;
  tags?: Array<{
    tag: Tag;
  }>;
  items?: LuxicleItem[];
}

export interface UserWithRelations extends User {
  followers_count?: number;
  following_count?: number;
}

// Query parameter types
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SearchParams extends PaginationParams {
  query: string;
}

export interface ChallengeFilters extends PaginationParams {
  categoryId?: string;
  tagIds?: string[];
  searchQuery?: string;
  featured?: boolean;
  active?: boolean;
}

export interface LuxicleFilters extends PaginationParams {
  userId?: string;
  challengeId?: string;
  categoryId?: string;
  tagIds?: string[];
  searchQuery?: string;
}

// Mutation types
export interface CreateLuxicleInput {
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
}

export interface UpdateLuxicleInput {
  luxicleId: string;
  userId: string;
  data: {
    title?: string;
    description?: string;
    categoryId?: string;
    isPublished?: boolean;
  };
}

export interface UpdateUserProfileInput {
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
}

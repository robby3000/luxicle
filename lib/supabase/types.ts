/* eslint-disable no-unused-vars */
// Based on the schema in luxicle-tech-spec-Claude.md
// Consider using `npx supabase gen types typescript --local > lib/supabase/types.ts` for more accurate types.

export interface UserProfile {
  id: string; // UUID
  email: string;
  username: string;
  display_name?: string | null;
  bio?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  website_url?: string | null;
  twitter_handle?: string | null;
  instagram_handle?: string | null;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  onboarding_completed: boolean;
}

export interface Follow {
  id: string; // UUID
  follower_id: string; // UUID, references users(id)
  followee_id: string; // UUID, references users(id)
  created_at: string; // TIMESTAMPTZ
}

export interface Category {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string | null;
  created_at: string; // TIMESTAMPTZ
}

export interface Tag {
  id: string; // UUID
  name: string;
  slug: string;
  usage_count: number;
  created_at: string; // TIMESTAMPTZ
}

export interface Challenge {
  id: string; // UUID
  title: string;
  description: string;
  rules?: string | null;
  category_id?: string | null; // UUID, references categories(id)
  cover_image_url?: string | null;
  opens_at: string; // TIMESTAMPTZ
  closes_at?: string | null; // TIMESTAMPTZ
  is_featured: boolean;
  submission_count: number;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  // For junction table, consider how to represent related tags
  tags?: Tag[]; // This might be fetched separately or joined
}

export interface ChallengeTag {
  challenge_id: string; // UUID, references challenges(id)
  tag_id: string; // UUID, references tags(id)
}

export interface Luxicle {
  id: string; // UUID
  user_id: string; // UUID, references users(id)
  challenge_id: string; // UUID, references challenges(id)
  title: string;
  description?: string | null;
  category_id?: string | null; // UUID, references categories(id)
  is_published: boolean;
  view_count: number;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  // For junction table, consider how to represent related tags
  tags?: Tag[]; // This might be fetched separately or joined
  // For related user and challenge data, if joined
  user?: Pick<UserProfile, 'username' | 'display_name' | 'avatar_url'>;
  challenge?: Pick<Challenge, 'title'>;
}

export interface LuxicleTag {
  luxicle_id: string; // UUID, references luxicles(id)
  tag_id: string; // UUID, references tags(id)
}

export interface LuxicleItem {
  id: string; // UUID
  luxicle_id: string; // UUID, references luxicles(id)
  title: string;
  description?: string | null;
  media_url?: string | null;
  item_type: 'text' | 'image' | 'video' | 'link'; // Example types
  order: number;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface Comment {
  id: string; // UUID
  user_id: string; // UUID, references users(id)
  luxicle_id: string; // UUID, references luxicles(id)
  parent_comment_id?: string | null; // UUID, references comments(id)
  body: string;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface Reaction {
  id: string; // UUID
  user_id: string; // UUID, references users(id)
  luxicle_id: string; // UUID, references luxicles(id)
  emoji: string; // e.g., '👍', '❤️'
  created_at: string; // TIMESTAMPTZ
}

export interface Message {
  id: string; // UUID
  sender_id: string; // UUID, references users(id)
  receiver_id: string; // UUID, references users(id)
  body: string;
  read_at?: string | null; // TIMESTAMPTZ
  created_at: string; // TIMESTAMPTZ
}

export interface Flag {
  id: string; // UUID
  reporter_id: string; // UUID, references users(id)
  luxicle_id?: string | null; // UUID, references luxicles(id)
  comment_id?: string | null; // UUID, references comments(id)
  user_id?: string | null; // UUID, references users(id) (for profile flags)
  reason: string;
  details?: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

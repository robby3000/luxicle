// Common types for query functions
export type GetUserProfileParams = {
  userId?: string;
  username?: string;
};

export type UpdateUserProfileParams = {
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

export type GetChallengesParams = {
  categoryId?: string;
  tagIds?: string[];
  searchQuery?: string;
  featured?: boolean;
  active?: boolean;
  limit?: number;
  offset?: number;
};

export type CreateLuxicleParams = {
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

export type UpdateLuxicleParams = {
  luxicleId: string;
  userId: string; // For authorization check
  data: {
    title?: string;
    description?: string;
    categoryId?: string;
    isPublished?: boolean;
  };
};

export type SearchParams = {
  query: string;
  limit?: number;
  offset?: number;
};

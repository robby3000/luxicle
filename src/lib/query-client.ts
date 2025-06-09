import { QueryClient } from '@tanstack/react-query';

// Default stale time of 5 minutes (300000ms)
const FIVE_MINUTES = 5 * 60 * 1000;

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Query keys for caching and invalidation
export const queryKeys = {
  // User related queries
  users: {
    all: ['users'] as const,
    profile: (userId: string) => ['users', 'profile', userId] as const,
    byUsername: (username: string) => ['users', 'username', username] as const,
    followers: (userId: string) => ['users', 'followers', userId] as const,
    following: (userId: string) => ['users', 'following', userId] as const,
  },
  
  // Challenge related queries
  challenges: {
    all: ['challenges'] as const,
    detail: (id: string) => ['challenges', id] as const,
    byCategory: (categoryId: string) => ['challenges', 'category', categoryId] as const,
    byTag: (tagId: string) => ['challenges', 'tag', tagId] as const,
    featured: ['challenges', 'featured'] as const,
    active: ['challenges', 'active'] as const,
  },
  
  // Luxicle related queries
  luxicles: {
    all: ['luxicles'] as const,
    detail: (id: string) => ['luxicles', id] as const,
    byUser: (userId: string) => ['luxicles', 'user', userId] as const,
    byChallenge: (challengeId: string) => ['luxicles', 'challenge', challengeId] as const,
    feed: (userId: string) => ['luxicles', 'feed', userId] as const,
  },
  
  // Category and tag related queries
  categories: {
    all: ['categories'] as const,
    detail: (id: string) => ['categories', id] as const,
  },
  
  tags: {
    all: ['tags'] as const,
    popular: ['tags', 'popular'] as const,
    byCategory: (categoryId: string) => ['tags', 'category', categoryId] as const,
  },
  
  // Search related queries
  search: {
    luxicles: (query: string) => ['search', 'luxicles', query] as const,
    users: (query: string) => ['search', 'users', query] as const,
    challenges: (query: string) => ['search', 'challenges', query] as const,
  },
};

// Helper function to invalidate queries
export const invalidateQueries = {
  userProfile: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(userId) });
  },
  
  challenge: (challengeId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.challenges.detail(challengeId) });
  },
  
  luxicle: (luxicleId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.luxicles.detail(luxicleId) });
  },
  
  userLuxicles: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.luxicles.byUser(userId) });
  },
  
  challengeLuxicles: (challengeId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.luxicles.byChallenge(challengeId) });
  },
  
  allChallenges: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.challenges.all });
  },
  
  allLuxicles: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.luxicles.all });
  },
};

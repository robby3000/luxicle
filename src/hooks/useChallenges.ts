'use client';

import { useQuery } from '@tanstack/react-query';
import { getChallenges, getChallenge } from '@/lib/supabase/queries';
import { useState } from 'react';

// Define query keys locally to avoid import issues
const challengeKeys = {
  all: ['challenges'] as const,
  detail: (id: string) => ['challenges', id] as const,
  byCategory: (categoryId: string) => ['challenges', 'category', categoryId] as const,
  byTag: (tagId: string) => ['challenges', 'tag', tagId] as const,
  featured: ['challenges', 'featured'] as const,
  active: ['challenges', 'active'] as const,
};

type UseChallengesParams = {
  categoryId?: string;
  tagIds?: string[];
  searchQuery?: string;
  featured?: boolean;
  active?: boolean;
  limit?: number;
  offset?: number;
  enabled?: boolean;
};

type UseChallengeParams = {
  challengeId: string;
  enabled?: boolean;
};

/**
 * Hook for fetching multiple challenges with filtering options
 */
export function useChallenges({
  categoryId,
  tagIds,
  searchQuery,
  featured,
  active,
  limit = 10,
  offset = 0,
  enabled = true,
}: UseChallengesParams = {}) {
  const [error, setError] = useState<Error | null>(null);
  
  // Determine the appropriate query key based on the filters
  let queryKey: readonly unknown[] = challengeKeys.all;
  
  if (categoryId) {
    queryKey = challengeKeys.byCategory(categoryId);
  } else if (tagIds && tagIds.length > 0) {
    queryKey = ['challenges', 'tags', tagIds.join(',')];
  } else if (featured) {
    queryKey = challengeKeys.featured;
  } else if (active) {
    queryKey = challengeKeys.active;
  }
  
  // Create a derived query key with additional filters
  const fullQueryKey = [...queryKey];
  
  // Add search query to the key if present
  if (searchQuery) {
    fullQueryKey.push({ search: searchQuery });
  }
  
  // Add pagination to the key
  fullQueryKey.push({ limit, offset });
  
  const query = useQuery({
    queryKey: fullQueryKey,
    queryFn: () => getChallenges({
      categoryId,
      tagIds,
      searchQuery,
      featured,
      active,
      limit,
      offset,
    }),
    enabled,
  });
  
  // Handle error separately to avoid type issues
  if (query.error instanceof Error) {
    setError(query.error);
  }
  
  return {
    challenges: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching a single challenge by ID
 */
export function useChallenge({ challengeId, enabled = true }: UseChallengeParams) {
  const [error, setError] = useState<Error | null>(null);
  
  const query = useQuery({
    queryKey: challengeKeys.detail(challengeId),
    queryFn: () => getChallenge(challengeId),
    enabled: Boolean(enabled && challengeId),
  });
  
  // Handle error separately to avoid type issues
  if (query.error instanceof Error) {
    setError(query.error);
  }
  
  return {
    challenge: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error,
    refetch: query.refetch,
  };
}

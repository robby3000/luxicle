'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getLuxicle, 
  createLuxicle, 
  updateLuxicle, 
  searchLuxicles 
} from '@/lib/supabase/queries';
import { useState } from 'react';

// Define query keys for caching and invalidation
const LUXICLE_KEYS = {
  all: ['luxicles'] as const,
  details: () => [...LUXICLE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...LUXICLE_KEYS.details(), id] as const,
  byUser: (userId: string) => [...LUXICLE_KEYS.all, 'user', userId] as const,
  byChallenge: (challengeId: string) => [...LUXICLE_KEYS.all, 'challenge', challengeId] as const,
  search: (query: string) => [...LUXICLE_KEYS.all, 'search', query] as const,
};

type UseLuxicleParams = {
  luxicleId: string;
  enabled?: boolean;
};

type UseSearchLuxiclesParams = {
  query: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
};

type CreateLuxicleData = {
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

type UpdateLuxicleData = {
  luxicleId: string;
  userId: string;
  data: {
    title?: string;
    description?: string;
    categoryId?: string;
    isPublished?: boolean;
  };
};

/**
 * Hook for fetching a single luxicle by ID
 */
export function useLuxicle({ luxicleId, enabled = true }: UseLuxicleParams) {
  const [error, setError] = useState<Error | null>(null);
  
  const result = useQuery({
    queryKey: LUXICLE_KEYS.detail(luxicleId) as any,
    queryFn: () => getLuxicle(luxicleId),
    enabled: Boolean(enabled && luxicleId),
  } as any);
  
  // Handle error separately to avoid type issues
  if (result.error instanceof Error) {
    setError(result.error);
  }
  
  return {
    luxicle: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error,
    refetch: result.refetch,
  };
}

/**
 * Hook for searching luxicles
 */
export function useSearchLuxicles({
  query,
  limit,
  offset,
  enabled = true,
}: UseSearchLuxiclesParams) {
  const [error, setError] = useState<Error | null>(null);
  
  // Use type assertion to satisfy TypeScript
  const result = useQuery({
    queryKey: LUXICLE_KEYS.search(query) as any,
    queryFn: () => searchLuxicles({ query, limit, offset }),
    enabled: Boolean(enabled && query),
  } as any);
  
  // Handle error separately to avoid type issues
  if (result.error instanceof Error) {
    setError(result.error);
  }
  
  return {
    luxicles: result.data || [],
    isLoading: result.isLoading,
    isError: result.isError,
    error,
    refetch: result.refetch,
  };
}

/**
 * Hook for creating and updating luxicles
 */
export function useLuxicleMutations() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);
  
  // Create luxicle mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateLuxicleData) => createLuxicle(data),
    onSuccess: (newLuxicle: any) => {
      if (!newLuxicle) return;
      
      // Update queries
      queryClient.setQueryData(
        LUXICLE_KEYS.detail(newLuxicle.id) as any,
        newLuxicle
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries(
        { queryKey: LUXICLE_KEYS.byUser(newLuxicle.user_id) as any }
      );
      queryClient.invalidateQueries(
        { queryKey: LUXICLE_KEYS.byChallenge(newLuxicle.challenge_id) as any }
      );
      
      setError(null);
    },
    onError: (err: any) => {
      if (err instanceof Error) {
        setError(err);
      }
    },
  } as any);
  
  // Update luxicle mutation
  const updateMutation = useMutation({
    mutationFn: ({ luxicleId, userId, data }: UpdateLuxicleData) => 
      updateLuxicle({ luxicleId, userId, data }),
    onSuccess: (updatedLuxicle: any) => {
      if (!updatedLuxicle) return;
      
      // Update queries
      queryClient.setQueryData(
        LUXICLE_KEYS.detail(updatedLuxicle.id) as any,
        (oldData: any) => {
          return oldData ? { ...oldData, ...updatedLuxicle } : updatedLuxicle;
        }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries(
        { queryKey: LUXICLE_KEYS.byUser(updatedLuxicle.user_id) as any }
      );
      queryClient.invalidateQueries(
        { queryKey: LUXICLE_KEYS.byChallenge(updatedLuxicle.challenge_id) as any }
      );
      
      setError(null);
    },
    onError: (err: any) => {
      if (err instanceof Error) {
        setError(err);
      }
    },
  } as any);
  
  return {
    createLuxicle: createMutation.mutate,
    updateLuxicle: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCreateSuccess: createMutation.isSuccess,
    isUpdateSuccess: updateMutation.isSuccess,
    reset: () => {
      createMutation.reset();
      updateMutation.reset();
      setError(null);
    },
    error,
  };
}

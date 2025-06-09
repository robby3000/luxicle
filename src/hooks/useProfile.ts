'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/queries';
import { useState } from 'react';

// Define query keys for caching and invalidation
const USER_KEYS = {
  all: ['users'] as const,
  details: () => [...USER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
  byUsername: (username: string) => [...USER_KEYS.all, 'username', username] as const,
};

type UseProfileParams = {
  userId?: string;
  username?: string;
  enabled?: boolean;
};

type UpdateProfileData = {
  userId: string;
  data: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    website?: string;
    social_links?: Record<string, string>;
  };
};

/**
 * Hook for fetching a user profile by ID or username
 */
export function useProfile({
  userId,
  username,
  enabled = true,
}: UseProfileParams = {}) {
  const [error, setError] = useState<Error | null>(null);
  
  // Determine query key based on provided params
  const queryKey = userId 
    ? USER_KEYS.detail(userId) 
    : username 
    ? USER_KEYS.byUsername(username) 
    : ['users', 'unknown'];
  
  // Use type assertion to satisfy TypeScript
  const result = useQuery({
    queryKey: queryKey as any,
    queryFn: () => getUserProfile({ userId, username }),
    enabled: Boolean(enabled && (userId || username)),
    retry: false,
  });
  
  // Handle error separately to avoid type issues
  if (result.error instanceof Error) {
    setError(result.error);
  }
  
  return {
    profile: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error,
    refetch: result.refetch,
  };
}

/**
 * Hook for updating a user profile
 */
export function useProfileMutation() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);
  
  // Use type assertion for useMutation to satisfy TypeScript
  const mutation = useMutation({
    mutationFn: (data: UpdateProfileData) => updateUserProfile(data),
    onSuccess: (updatedProfile: any) => {
      if (!updatedProfile) return;
      
      // Update queries with type assertions
      queryClient.setQueryData(
        USER_KEYS.detail(updatedProfile.id) as any,
        (oldData: any) => {
          return oldData ? { ...oldData, ...updatedProfile } : updatedProfile;
        }
      );
      
      // If username was updated, also update username-based queries
      if (updatedProfile.username) {
        queryClient.setQueryData(
          USER_KEYS.byUsername(updatedProfile.username) as any,
          (oldData: any) => {
            return oldData ? { ...oldData, ...updatedProfile } : updatedProfile;
          }
        );
      }
      
      setError(null);
    },
    onError: (err: any) => {
      if (err instanceof Error) {
        setError(err);
      }
    },
  } as any);
  
  return {
    updateProfile: mutation.mutate,
    isUpdating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
    error,
  };
}

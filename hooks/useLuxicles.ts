import { useQuery, useMutation, useQueryClient, QueryKey, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getLuxicle,
  createLuxicle,
  updateLuxicle,
  searchLuxicles,
} from '@/lib/supabase/queries';
import { Luxicle } from '@/lib/supabase/types';

// --- Query Keys ---_-
const luxiclesQueryKeys = {
  all: ['luxicles'] as const,
  lists: () => [...luxiclesQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...luxiclesQueryKeys.lists(), { filters }] as const,
  details: () => [...luxiclesQueryKeys.all, 'detail'] as const,
  detail: (id: string | undefined) => [...luxiclesQueryKeys.details(), id] as const,
};

// --- Hook for fetching a single Luxicle ---_-
interface UseLuxicleOptions {
  luxicleId: string | undefined;
  supabaseClient: SupabaseClient;
  queryOptions?: Partial<UseQueryOptions<Luxicle | null, Error>>;
}

export function useLuxicle({
  luxicleId,
  supabaseClient,
  queryOptions,
}: UseLuxicleOptions) {
  return useQuery<Luxicle | null, Error>({
    queryKey: luxiclesQueryKeys.detail(luxicleId),
    queryFn: async () => {
      if (!luxicleId) return null;
      return getLuxicle(supabaseClient, luxicleId);
    },
    enabled: !!luxicleId && (queryOptions?.enabled === undefined ? true : queryOptions.enabled),
    ...queryOptions,
  });
}

// --- Hook for searching Luxicles ---_-
interface LuxicleSearchFiltersInternal {
  categoryId?: string;
  tags?: string[];
  userId?: string;
}
interface UseSearchLuxiclesOptions {
  query: string;
  filters?: LuxicleSearchFiltersInternal;
  supabaseClient: SupabaseClient;
  queryOptions?: Partial<UseQueryOptions<Luxicle[], Error>>;
}

export function useSearchLuxicles({
  query,
  filters,
  supabaseClient,
  queryOptions,
}: UseSearchLuxiclesOptions) {
  // Create a stable key for filters by stringifying them
  const filterKey = JSON.stringify(filters || {});
  return useQuery<Luxicle[], Error>({
    queryKey: luxiclesQueryKeys.list(`search-${query}-${filterKey}`),
    queryFn: async () => {
      if (!query && !filters) return []; // Or fetch all if query is empty, depending on desired behavior
      return searchLuxicles(supabaseClient, query, filters);
    },
    enabled: (queryOptions?.enabled === undefined ? true : queryOptions.enabled),
    ...queryOptions,
  });
}

// --- Hook for creating a Luxicle ---_-
interface UseCreateLuxicleOptions {
  supabaseClient: SupabaseClient;
  mutationOptions?: Partial<UseMutationOptions<Luxicle | null, Error, Omit<Luxicle, 'id' | 'created_at' | 'updated_at' | 'view_count'>>>;
}

export function useCreateLuxicle({
  supabaseClient,
  mutationOptions,
}: UseCreateLuxicleOptions) {
  const queryClient = useQueryClient();

  return useMutation<Luxicle | null, Error, Omit<Luxicle, 'id' | 'created_at' | 'updated_at' | 'view_count'>>({
    mutationFn: async (luxicleData) => {
      return createLuxicle(supabaseClient, luxicleData);
    },
    onSuccess: (data) => {
      // Invalidate queries that would include this new luxicle
      queryClient.invalidateQueries({ queryKey: luxiclesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: luxiclesQueryKeys.details() }); // Might be too broad, refine if needed
      if (data) {
        queryClient.setQueryData(luxiclesQueryKeys.detail(data.id), data); // Pre-populate detail cache
      }
      mutationOptions?.onSuccess?.(data, {} as any, undefined); // Call original onSuccess if provided
    },
    ...mutationOptions,
  });
}

// --- Hook for updating a Luxicle ---_-
interface UseUpdateLuxicleOptions {
  supabaseClient: SupabaseClient;
  mutationOptions?: Partial<UseMutationOptions<Luxicle | null, Error, { luxicleId: string; updates: Partial<Luxicle> }>>;
}

export function useUpdateLuxicle({
  supabaseClient,
  mutationOptions,
}: UseUpdateLuxicleOptions) {
  const queryClient = useQueryClient();

  return useMutation<Luxicle | null, Error, { luxicleId: string; updates: Partial<Luxicle> }>({
    mutationFn: async ({ luxicleId, updates }) => {
      return updateLuxicle(supabaseClient, luxicleId, updates);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: luxiclesQueryKeys.list('') }); // Invalidate all lists, refine if possible
      queryClient.invalidateQueries({ queryKey: luxiclesQueryKeys.detail(variables.luxicleId) });
      if (data) {
        queryClient.setQueryData(luxiclesQueryKeys.detail(variables.luxicleId), data); // Update detail cache
      }
      mutationOptions?.onSuccess?.(data, variables, undefined);
    },
    ...mutationOptions,
  });
}

/*
Example Usage:

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useLuxicle, useCreateLuxicle, useSearchLuxicles } from '@/hooks/useLuxicles';

function LuxiclePage({ luxicleId }) {
  const supabaseClient = useSupabaseClient();
  const { data: luxicle, isLoading } = useLuxicle({ luxicleId, supabaseClient });
  // ... render luxicle
}

function CreateLuxicleForm() {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const { mutate: create, isPending } = useCreateLuxicle({
    supabaseClient,
    mutationOptions: {
      onSuccess: (newLuxicle) => console.log('Created!', newLuxicle),
    }
  });

  const handleSubmit = (formData) => {
    if (!user?.id) return;
    create({ ...formData, user_id: user.id, challenge_id: 'some-challenge-id' });
  };
  // ... render form
}
*/

import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/queries';
import { UserProfile } from '@/lib/supabase/types';

// --- Query Keys ---_-
const userProfileQueryKey = (userId: string | undefined): QueryKey => ['userProfile', userId];

// --- Hook for fetching user profile ---_-
interface UseUserProfileOptions {
  userId: string | undefined; // Make userId potentially undefined if not immediately available
  supabaseClient: SupabaseClient; // Pass Supabase client as a prop
  initialData?: UserProfile | (() => UserProfile | undefined) | undefined;
  enabled?: boolean;
}

export function useUserProfile({
  userId,
  supabaseClient,
  initialData,
  enabled = true,
}: UseUserProfileOptions) {
  return useQuery<UserProfile | null, Error>({
    queryKey: userProfileQueryKey(userId),
    queryFn: async () => {
      if (!userId) return null; // Or throw an error, depending on desired behavior
      return getUserProfile(supabaseClient, userId);
    },
    initialData,
    enabled: enabled && !!userId, // Only run query if userId is available and hook is enabled
    staleTime: 1000 * 60 * 5, // 5 minutes, can be overridden by global config
  });
}

// --- Hook for mutating user profile ---_-
interface UseUpdateUserProfileOptions {
  supabaseClient: SupabaseClient;
  onSuccess?: (data: UserProfile | null) => void;
  onError?: (error: Error) => void;
}

export function useUpdateUserProfile({
  supabaseClient,
  onSuccess,
  onError,
}: UseUpdateUserProfileOptions) {
  const queryClient = useQueryClient();

  return useMutation<
    UserProfile | null, // Return type of mutationFn
    Error,              // Error type
    { userId: string; updates: Partial<UserProfile> } // Variables type for mutationFn
  >({
    mutationFn: async ({ userId, updates }) => {
      return updateUserProfile(supabaseClient, userId, updates);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the user profile query to update the UI
      queryClient.invalidateQueries({ queryKey: userProfileQueryKey(variables.userId) });
      // Optionally, optimistically update the cache if desired
      // queryClient.setQueryData(userProfileQueryKey(variables.userId), data);
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      if (onError) onError(error);
      // Handle error (e.g., show a toast notification)
      console.error('Failed to update profile:', error.message);
    },
  });
}

/*
Example Usage:

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'; // Or your auth solution
import { useUserProfile, useUpdateUserProfile } from '@/hooks/useProfile';

function ProfilePage() {
  const supabaseClient = useSupabaseClient(); // Get Supabase client
  const user = useUser(); // Get current authenticated user

  const { data: profile, isLoading, error } = useUserProfile({
    userId: user?.id,
    supabaseClient,
    enabled: !!user, // Only fetch if user is loaded
  });

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateUserProfile({
    supabaseClient,
    onSuccess: (updatedProfile) => {
      console.log('Profile updated!', updatedProfile);
      // Show success toast
    },
    onError: (err) => {
      console.error('Update failed', err);
      // Show error toast
    }
  });

  if (isLoading) return <p>Loading profile...</p>;
  if (error) return <p>Error loading profile: {error.message}</p>;
  if (!profile) return <p>No profile found.</p>;

  const handleUpdate = () => {
    if (user?.id) {
      updateProfile({ userId: user.id, updates: { display_name: 'New Display Name' } });
    }
  };

  return (
    <div>
      <h1>{profile.display_name || profile.username}</h1>
      <p>{profile.bio}</p>
      <button onClick={handleUpdate} disabled={isUpdating}>
        {isUpdating ? 'Updating...' : 'Update Name'}
      </button>
    </div>
  );
}
*/

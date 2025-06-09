import { useQuery, QueryKey } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { getChallenges, getChallenge } from '@/lib/supabase/queries';
import { Challenge } from '@/lib/supabase/types';

// --- Query Keys ---_-
const challengesListQueryKey = (): QueryKey => ['challenges', 'list'];
const challengeDetailQueryKey = (challengeId: string | undefined): QueryKey => ['challenges', 'detail', challengeId];

// --- Hook for fetching all challenges ---_-
interface UseChallengesOptions {
  supabaseClient: SupabaseClient;
  initialData?: Challenge[] | (() => Challenge[] | undefined) | undefined;
  enabled?: boolean;
}

export function useChallenges({
  supabaseClient,
  initialData,
  enabled = true,
}: UseChallengesOptions) {
  return useQuery<Challenge[], Error>({
    queryKey: challengesListQueryKey(),
    queryFn: async () => {
      return getChallenges(supabaseClient);
    },
    initialData,
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes, challenges list might change more often
  });
}

// --- Hook for fetching a single challenge ---_-
interface UseChallengeOptions {
  challengeId: string | undefined;
  supabaseClient: SupabaseClient;
  initialData?: Challenge | (() => Challenge | undefined) | undefined;
  enabled?: boolean;
}

export function useChallenge({
  challengeId,
  supabaseClient,
  initialData,
  enabled = true,
}: UseChallengeOptions) {
  return useQuery<Challenge | null, Error>({
    queryKey: challengeDetailQueryKey(challengeId),
    queryFn: async () => {
      if (!challengeId) return null;
      return getChallenge(supabaseClient, challengeId);
    },
    initialData,
    enabled: enabled && !!challengeId, // Only run query if challengeId is available
    staleTime: 1000 * 60 * 5, // 5 minutes for individual challenge details
  });
}

/*
Example Usage:

import { useSupabaseClient } from '@supabase/auth-helpers-react'; // Or your auth solution
import { useChallenges, useChallenge } from '@/hooks/useChallenges';

function ChallengesListPage() {
  const supabaseClient = useSupabaseClient();
  const { data: challenges, isLoading, error } = useChallenges({ supabaseClient });

  if (isLoading) return <p>Loading challenges...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {challenges?.map(challenge => (
        <li key={challenge.id}>{challenge.title}</li>
      ))}
    </ul>
  );
}

function ChallengeDetailPage({ challengeId }: { challengeId: string }) {
  const supabaseClient = useSupabaseClient();
  const { data: challenge, isLoading, error } = useChallenge({
    challengeId,
    supabaseClient,
    enabled: !!challengeId
  });

  if (isLoading) return <p>Loading challenge details...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!challenge) return <p>Challenge not found.</p>;

  return <h1>{challenge.title}</h1>;
}
*/

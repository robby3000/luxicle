"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SupabaseClient } from "@supabase/supabase-js";
import { UserProfile } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, UserPlus, UserCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

interface ProfileSearchProps {
  supabaseClient: SupabaseClient;
  currentUserId?: string;
}

export function ProfileSearch({ supabaseClient, currentUserId }: ProfileSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  
  // Search profiles query
  const {
    data: profiles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profileSearch", initialQuery],
    queryFn: async () => {
      if (!initialQuery) return [];
      
      const { data, error } = await supabaseClient
        .from("user_profiles")
        .select("*")
        .or(`username.ilike.%${initialQuery}%,display_name.ilike.%${initialQuery}%`)
        .order("username", { ascending: true })
        .limit(20);
        
      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: !!initialQuery,
  });
  
  // Follow/unfollow mutation
  const { mutate: toggleFollow } = useMutation({
    mutationFn: async ({ profileId, isFollowing }: { profileId: string; isFollowing: boolean }) => {
      if (!currentUserId) throw new Error("You must be logged in to follow users");
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabaseClient
          .from("follows")
          .delete()
          .match({ follower_id: currentUserId, followee_id: profileId });
          
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabaseClient
          .from("follows")
          .insert({ follower_id: currentUserId, followee_id: profileId });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["profileSearch"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("q", searchQuery.trim());
      router.push(`/search/profiles?${params.toString()}`);
    }
  };

  // Check if current user is following a profile
  const checkIsFollowing = async (profileId: string): Promise<boolean> => {
    if (!currentUserId) return false;
    
    const { data } = await supabaseClient
      .from("follows")
      .select("*")
      .eq("follower_id", currentUserId)
      .eq("followee_id", profileId)
      .maybeSingle();
      
    return !!data;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <EmptyState
          title="Error searching profiles"
          description="There was a problem searching for profiles. Please try again."
          onAction={() => {
            // Create a proper form event handler that doesn't require casting
            const formEl = document.querySelector('form');
            if (formEl) formEl.requestSubmit();
          }}
          actionLabel="Retry"
        />
      ) : initialQuery && (!profiles || profiles.length === 0) ? (
        <EmptyState
          title="No profiles found"
          description={`No profiles found matching "${initialQuery}"`}
        />
      ) : profiles ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              currentUserId={currentUserId}
              supabaseClient={supabaseClient}
              onToggleFollow={toggleFollow}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface ProfileCardProps {
  profile: UserProfile;
  currentUserId?: string;
  supabaseClient: SupabaseClient;
  onToggleFollow: ({ profileId, isFollowing }: { profileId: string; isFollowing: boolean }) => void;
}

function ProfileCard({ profile, currentUserId, supabaseClient, onToggleFollow }: ProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if current user is following this profile
  const checkFollowStatus = async () => {
    if (!currentUserId) return;
    
    try {
      const { data } = await supabaseClient
        .from("follows")
        .select("*")
        .eq("follower_id", currentUserId)
        .eq("followee_id", profile.id)
        .maybeSingle();
        
      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };
  
  // Check follow status on mount
  useEffect(() => {
    checkFollowStatus();
  }, [currentUserId, profile.id]);
  
  const handleToggleFollow = async () => {
    if (!currentUserId) return;
    if (currentUserId === profile.id) return; // Can't follow yourself
    
    setIsLoading(true);
    try {
      await onToggleFollow({ profileId: profile.id, isFollowing });
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Link
            href={`/users/${profile.username}`}
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
          >
            <UserAvatar user={profile} size="md" />
            <div>
              <h3 className="font-medium">{profile.display_name || profile.username}</h3>
              <p className="text-muted-foreground text-sm">@{profile.username}</p>
            </div>
          </Link>
          
          {currentUserId && currentUserId !== profile.id && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              onClick={handleToggleFollow}
              disabled={isLoading}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
        

        
        {profile.bio && (
          <p className="mt-2 text-sm line-clamp-2">{profile.bio}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default ProfileSearch;

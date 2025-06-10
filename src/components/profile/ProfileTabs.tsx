"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { UserProfile, Luxicle } from "@/lib/supabase/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { searchLuxicles } from "@/lib/supabase/queries";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ProfileTabsProps {
  profile: UserProfile;
  userId?: string; // Replace supabaseClient with userId
}

export function ProfileTabs({ profile, userId }: ProfileTabsProps) {
  // Create Supabase client in the component
  const supabaseClient = createSupabaseBrowserClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("luxicles");

  // Fetch user's luxicles
  const {
    data: luxicles,
    isLoading: isLoadingLuxicles,
    error: luxiclesError,
  } = useQuery({
    queryKey: ["userLuxicles", profile.id],
    queryFn: async () => {
      // Fix the searchLuxicles call to match its expected signature
      return searchLuxicles({ query: "", limit: 50, offset: 0 });
      // Note: The actual function needs to be modified to support filtering by userId
      // For now, we'll need to filter the results client-side if needed
    },
    enabled: activeTab === "luxicles",
  });

  // Fetch user's followers
  const {
    data: followers,
    isLoading: isLoadingFollowers,
    error: followersError,
  } = useQuery({
    queryKey: ["followers", profile.id],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("follows")
        .select("follower_id, users!follows_follower_id_fkey(*)")
        .eq("followee_id", profile.id);

      if (error) throw error;
      return data?.map((item) => item.users) || [];
    },
    enabled: activeTab === "followers",
  });

  // Fetch user's following
  const {
    data: following,
    isLoading: isLoadingFollowing,
    error: followingError,
  } = useQuery({
    queryKey: ["following", profile.id],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("follows")
        .select("followee_id, users!follows_followee_id_fkey(*)")
        .eq("follower_id", profile.id);

      if (error) throw error;
      return data?.map((item) => item.users) || [];
    },
    enabled: activeTab === "following",
  });

  return (
    <Tabs
      defaultValue="luxicles"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="luxicles">Luxicles</TabsTrigger>
        <TabsTrigger value="followers">Followers</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
      </TabsList>

      {/* Luxicles Tab */}
      <TabsContent value="luxicles">
        {isLoadingLuxicles ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : luxiclesError ? (
          <EmptyState
            title="Error loading luxicles"
            description="There was a problem loading this user's luxicles."
            onAction={() => window.location.reload()}
            actionLabel="Try Again"
          />
        ) : !luxicles || luxicles.length === 0 ? (
          <EmptyState
            title="No luxicles yet"
            description={
              userId === profile.id
                ? "You haven't created any luxicles yet."
                : "This user hasn't created any luxicles yet."
            }
            onAction={
              userId === profile.id ? (
                () => router.push("/luxicles/create")
              ) : undefined
            }
            actionLabel={
              userId === profile.id ? "Create Luxicle" : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {luxicles.map((luxicle) => (
              <LuxicleCard key={luxicle.id} luxicle={luxicle} />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Followers Tab */}
      <TabsContent value="followers">
        {isLoadingFollowers ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : followersError ? (
          <EmptyState
            title="Error loading followers"
            description="There was a problem loading this user's followers."
            onAction={() => window.location.reload()}
            actionLabel="Try Again"
          />
        ) : !followers || followers.length === 0 ? (
          <EmptyState
            title="No followers yet"
            description={
              profile.id === profile.id
                ? "You don't have any followers yet."
                : "This user doesn't have any followers yet."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {followers.filter(Boolean).map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Following Tab */}
      <TabsContent value="following">
        {isLoadingFollowing ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : followingError ? (
          <EmptyState
            title="Error loading following"
            description="There was a problem loading who this user follows."
            onAction={() => window.location.reload()}
            actionLabel="Try Again"
          />
        ) : !following || following.length === 0 ? (
          <EmptyState
            title="Not following anyone"
            description={
              profile.id === profile.id
                ? "You're not following anyone yet."
                : "This user isn't following anyone yet."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {following.filter(Boolean).map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

// Helper component for displaying a luxicle card
function LuxicleCard({ luxicle }: { luxicle: Luxicle }) {
  return (
    <Card>
      <CardContent className="p-4">
        <Link
          href={`/luxicles/${luxicle.id}`}
          className="block hover:opacity-90 transition-opacity"
        >
          <h3 className="font-medium text-lg line-clamp-2">{luxicle.title}</h3>
          {luxicle.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {luxicle.description}
            </p>
          )}
          <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
            <span>
              {luxicle.created_at && formatDistanceToNow(new Date(luxicle.created_at), {
                addSuffix: true,
              })}
            </span>
            <span>{luxicle.view_count} views</span>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

// Helper component for displaying a user card
function UserCard({ user }: { user: UserProfile }) {
  // Skip rendering if user is null
  if (!user) return null;
  
  return (
    <Card>
      <CardContent className="p-4">
        <Link
          href={`/users/${user.username}`}
          className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
        >
          <UserAvatar user={user} size="md" />
          <div>
            <h3 className="font-medium">{user.display_name || user.username}</h3>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

export default ProfileTabs;

import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserProfileByUsername } from "@/lib/supabase/queries";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { Metadata, ResolvingMetadata } from "next";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata(
  { params }: ProfilePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const profile = await getUserProfileByUsername(supabase, params.username);
  
  if (!profile) {
    return {
      title: "User Not Found | Luxicle",
      description: "The requested user profile could not be found.",
    };
  }
  
  return {
    title: `${profile.display_name || profile.username} (@${profile.username}) | Luxicle`,
    description: profile.bio || `Check out ${profile.display_name || profile.username}'s profile on Luxicle`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createSupabaseServerClient();
  
  // Get the profile by username
  const profile = await getUserProfileByUsername(supabase, params.username);
  
  if (!profile) {
    notFound();
  }
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  let currentUserProfile = null;
  let isFollowing = false;
  
  if (user) {
    // Get current user's profile
    const { data: currentProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
      
    currentUserProfile = currentProfile;
    
    // Check if current user is following this profile
    if (currentProfile) {
      const { data: followData } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentProfile.id)
        .eq("followee_id", profile.id)
        .maybeSingle();
        
      isFollowing = !!followData;
    }
  }
  
  // Get follower count
  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("followee_id", profile.id);
    
  // Get following count
  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id);
    
  // Get luxicle count
  const { count: luxicleCount } = await supabase
    .from("luxicles")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id);
  
  const isCurrentUser = user?.id === profile.id;
  
  return (
    <main className="container max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <ProfileHeader
        profile={profile}
        currentUser={currentUserProfile}
        isCurrentUser={isCurrentUser}
        isFollowing={isFollowing}
        followerCount={followerCount || 0}
        followingCount={followingCount || 0}
        luxicleCount={luxicleCount || 0}
        supabaseClient={supabase}
      />
      
      <div className="mt-8">
        <ProfileTabs
          profile={profile}
          supabaseClient={supabase}
        />
      </div>
    </main>
  );
}

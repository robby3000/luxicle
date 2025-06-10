import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/queries";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | Luxicle",
  description: "View and manage your Luxicle profile",
};

export default async function ProfilePage() {
  // Get the cookie store and pass it to the Supabase server client
  // Important: await cookies() to avoid the sync dynamic APIs error
  const cookieStore = await cookies();
  // Cast to the expected type since cookies() returns a different type than what's expected
  const supabase = createSupabaseServerClient(cookieStore as any);
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  // Get user's profile
  const profile = await getUserProfile(supabase, user.id);
  
  if (!profile) {
    // This should rarely happen, but just in case
    redirect("/onboarding");
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
  
  // Extract only the user ID which is serializable, not the client object
  const userId = user?.id;

  return (
    <main className="container max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <h1 className="sr-only">My Profile</h1>
      
      <ProfileHeader
        profile={profile}
        currentUser={profile}
        isCurrentUser={true}
        isFollowing={false}
        followerCount={followerCount || 0}
        followingCount={followingCount || 0}
        luxicleCount={luxicleCount || 0}
        userId={userId} /* Pass userId instead of supabaseClient */
      />
      
      <div className="mt-8">
        <ProfileTabs
          profile={profile}
          userId={userId} /* Pass userId instead of supabaseClient */
        />
      </div>
    </main>
  );
}

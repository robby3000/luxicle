import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/queries";
import ProfileEdit from "@/components/profile/ProfileEdit";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile | Luxicle",
  description: "Update your profile information on Luxicle",
};

export default async function EditProfilePage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  const profile = await getUserProfile(supabase, user.id);
  
  if (!profile) {
    redirect("/profile");
  }
  
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      <ProfileEdit profile={profile} />
    </div>
  );
}

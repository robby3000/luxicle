"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProfile, Follow } from "@/lib/supabase/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { Pencil, MapPin, Link as LinkIcon, Twitter, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  profile: UserProfile;
  currentUser: UserProfile | null;
  isCurrentUser: boolean;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  luxicleCount: number;
  userId?: string; // Replace supabaseClient with userId
}

export function ProfileHeader({
  profile,
  currentUser,
  isCurrentUser,
  isFollowing,
  followerCount,
  followingCount,
  luxicleCount,
  userId, // Changed from supabaseClient
}: ProfileHeaderProps) {
  // Create Supabase client in the component
  const supabaseClient = createSupabaseBrowserClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  
  // Follow/Unfollow mutation
  const { mutate: toggleFollow, isPending: isTogglingFollow } = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("You must be logged in to follow users");
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabaseClient
          .from("follows")
          .delete()
          .match({ follower_id: currentUser.id, followee_id: profile.id });
          
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabaseClient
          .from("follows")
          .insert({ follower_id: currentUser.id, followee_id: profile.id });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
      queryClient.invalidateQueries({ queryKey: ["followers", profile.id] });
      queryClient.invalidateQueries({ queryKey: ["following", profile.id] });
    },
    onError: (error) => {
      console.error("Error toggling follow:", error);
      // You could add a toast notification here
    },
  });

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  return (
    <div className="w-full">
      {/* Cover Image */}
      <div 
        className="relative w-full h-48 md:h-64 bg-muted rounded-md overflow-hidden"
        onMouseEnter={() => isCurrentUser && setIsHoveringCover(true)}
        onMouseLeave={() => setIsHoveringCover(false)}
      >
        {profile.cover_url ? (
          <Image
            src={profile.cover_url}
            alt={`${profile.display_name || profile.username}'s cover`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
        
        {isCurrentUser && isHoveringCover && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Button variant="secondary" onClick={handleEditProfile}>
              <Pencil className="h-4 w-4 mr-2" />
              Change Cover
            </Button>
          </div>
        )}
      </div>
      
      {/* Profile Info */}
      <div className="px-4 relative pb-4">
        {/* Avatar */}
        <div className="relative -mt-16 mb-4">
          <UserAvatar 
            user={profile} 
            size="xl"
            className="border-4 border-background"
          />
          
          {/* Follow/Edit Button */}
          <div className="absolute bottom-0 right-0 md:right-4">
            {isCurrentUser ? (
              <Button onClick={handleEditProfile} variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button 
                onClick={() => toggleFollow()} 
                disabled={isTogglingFollow || !currentUser}
                variant={isFollowing ? "outline" : "default"}
                size="sm"
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
        
        {/* Name and Bio */}
        <div className="space-y-2 max-w-2xl">
          <div>
            <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          
          {profile.bio && (
            <p className="text-sm md:text-base">{profile.bio}</p>
          )}
          
          {/* Location and Links */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {profile.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.website_url && (
              <a 
                href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                <span>{new URL(profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`).hostname}</span>
              </a>
            )}
            
            {profile.twitter_handle && (
              <a 
                href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                <Twitter className="h-4 w-4 mr-1" />
                <span>{profile.twitter_handle}</span>
              </a>
            )}
            
            {profile.instagram_handle && (
              <a 
                href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                <Instagram className="h-4 w-4 mr-1" />
                <span>{profile.instagram_handle}</span>
              </a>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Stats */}
        <div className="flex space-x-6 text-sm">
          <div>
            <span className="font-bold">{luxicleCount}</span>{" "}
            <span className="text-muted-foreground">Luxicles</span>
          </div>
          <div>
            <span className="font-bold">{followerCount}</span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div>
            <span className="font-bold">{followingCount}</span>{" "}
            <span className="text-muted-foreground">Following</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;

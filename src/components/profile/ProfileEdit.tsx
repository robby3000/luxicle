"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { UserProfile } from "@/lib/supabase/types";
import { updateUserProfile } from "@/lib/supabase/queries";
import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import * as z from "zod";

// Using a simple random string generator instead of uuid
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Storage functions
async function uploadAvatar(
  supabaseClient: SupabaseClient,
  userId: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${generateUniqueId()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabaseClient.storage
      .from("user-content")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading avatar:", error.message);
      return null;
    }

    const { data: urlData } = supabaseClient.storage
      .from("user-content")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadAvatar:", error);
    return null;
  }
}

async function uploadCoverImage(
  supabaseClient: SupabaseClient,
  userId: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${generateUniqueId()}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error } = await supabaseClient.storage
      .from("user-content")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading cover image:", error.message);
      return null;
    }

    const { data: urlData } = supabaseClient.storage
      .from("user-content")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadCoverImage:", error);
    return null;
  }
}

// Profile schema
const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .transform((val) => val.toLowerCase()),
  
  display_name: z
    .string()
    .max(50, "Display name must be at most 50 characters")
    .optional()
    .or(z.literal("")),
  
  bio: z
    .string()
    .max(160, "Bio must be at most 160 characters")
    .optional()
    .or(z.literal("")),
  
  location: z
    .string()
    .max(100, "Location must be at most 100 characters")
    .optional()
    .or(z.literal("")),
  
  website_url: z
    .string()
    .max(100, "Website URL must be at most 100 characters")
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || val.startsWith("http://") || val.startsWith("https://"),
      "Website URL must start with http:// or https://"
    ),
  
  twitter_handle: z
    .string()
    .max(15, "Twitter handle must be at most 15 characters")
    .regex(/^[a-zA-Z0-9_]*$/, "Twitter handle can only contain letters, numbers, and underscores")
    .optional()
    .or(z.literal(""))
    .transform((val) => val ? val.replace(/^@/, "") : ""),
  
  instagram_handle: z
    .string()
    .max(30, "Instagram handle must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_.]*$/, "Instagram handle can only contain letters, numbers, underscores, and periods")
    .optional()
    .or(z.literal(""))
    .transform((val) => val ? val.replace(/^@/, "") : "")
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// UI Components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { AlertCircle, AtSign, Globe, Instagram, Twitter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileEditProps {
  profile: UserProfile;
}

function ProfileEdit({ profile }: ProfileEditProps) {
  const router = useRouter();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.cover_url);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with profile data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username || "",
      display_name: profile.display_name || "",
      bio: profile.bio || "",
      location: profile.location || "",
      website_url: profile.website_url || "",
      twitter_handle: profile.twitter_handle || "",
      instagram_handle: profile.instagram_handle || "",
    },
  });

  // Setup mutation for profile update
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      setError(null);
      const supabase = createSupabaseBrowserClient();
      
      // Upload avatar if changed
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar(supabase, profile.id, avatarFile);
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        } else {
          throw new Error("Failed to upload avatar");
        }
      }
      
      // Upload cover if changed
      let coverUrl = profile.cover_url;
      if (coverFile) {
        const newCoverUrl = await uploadCoverImage(supabase, profile.id, coverFile);
        if (newCoverUrl) {
          coverUrl = newCoverUrl;
        } else {
          throw new Error("Failed to upload cover image");
        }
      }
      
      // Update profile with new data and image URLs
      await updateUserProfile(supabase, profile.id, {
        ...data,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
      });
      
      return { success: true };
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/profile/${profile.username}`);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to update profile");
    },
  });

  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    mutate(data);
  };

  // Handle avatar upload
  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cover image upload
  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">
          Update your profile information and social links.
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Images */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Profile Images</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Profile Picture</h3>
                <div className="flex items-center space-x-4">
                  <UserAvatar
                    user={{ 
                      avatar_url: avatarPreview,
                      username: profile.username || "",
                      display_name: profile.display_name || ""
                    }}
                    className="h-16 w-16"
                  />
                  <ImageUpload
                    onChange={handleAvatarChange}
                    accept="image/png, image/jpeg, image/jpg, image/gif"
                    maxSize={2 * 1024 * 1024} // 2MB
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: Square image, at least 400x400px. Max 2MB.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Cover Image</h3>
                <div className="space-y-4">
                  {coverPreview && (
                    <div className="relative w-full h-32 rounded-md overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${coverPreview})` }}
                      />
                    </div>
                  )}
                  <ImageUpload
                    onChange={handleCoverChange}
                    accept="image/png, image/jpeg, image/jpg"
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: 1500x500px. Max 5MB.
                </p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Profile Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Profile Information</h2>
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    This is your public username. It can only contain letters, numbers, and underscores.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your name" />
                  </FormControl>
                  <FormDescription>
                    This is the name displayed on your profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Tell us about yourself..."
                      className="resize-none"
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description about yourself. Max 160 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="City, Country" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Separator />
          
          {/* Social Links */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Social Links</h2>
            
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input {...field} className="pl-10" placeholder="https://yourwebsite.com" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="twitter_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input {...field} className="pl-10" placeholder="username" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="instagram_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input {...field} className="pl-10" placeholder="username" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ProfileEdit;

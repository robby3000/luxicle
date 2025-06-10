import * as z from "zod";

// Schema for validating profile form data
export const profileSchema = z.object({
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
    .transform((val) => val.replace(/^@/, "")), // Remove @ if present
  
  instagram_handle: z
    .string()
    .max(30, "Instagram handle must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_.]*$/, "Instagram handle can only contain letters, numbers, underscores, and periods")
    .optional()
    .or(z.literal(""))
    .transform((val) => val.replace(/^@/, "")), // Remove @ if present
});

// Type for the profile form values
export type ProfileFormValues = z.infer<typeof profileSchema>;

// Schema for validating follow/unfollow actions
export const followSchema = z.object({
  followerId: z.string().uuid("Invalid follower ID"),
  followeeId: z.string().uuid("Invalid followee ID"),
});

// Type for follow/unfollow actions
export type FollowValues = z.infer<typeof followSchema>;

// Schema for validating profile search
export const profileSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
});

// Type for profile search
export type ProfileSearchValues = z.infer<typeof profileSearchSchema>;

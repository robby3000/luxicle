import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads an avatar image to Supabase storage
 * @param supabaseClient - The Supabase client instance
 * @param userId - The user ID
 * @param file - The image file to upload
 * @returns The URL of the uploaded avatar or null if upload fails
 */
export async function uploadAvatar(
  supabaseClient: SupabaseClient,
  userId: string,
  file: File
): Promise<string | null> {
  try {
    // Generate a unique filename with the original extension
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${uuidv4()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload the file
    const { data, error } = await supabaseClient.storage
      .from("user-content")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading avatar:", error.message);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabaseClient.storage
      .from("user-content")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadAvatar:", error);
    return null;
  }
}

/**
 * Uploads a cover image to Supabase storage
 * @param supabaseClient - The Supabase client instance
 * @param userId - The user ID
 * @param file - The image file to upload
 * @returns The URL of the uploaded cover image or null if upload fails
 */
export async function uploadCoverImage(
  supabaseClient: SupabaseClient,
  userId: string,
  file: File
): Promise<string | null> {
  try {
    // Generate a unique filename with the original extension
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${uuidv4()}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    // Upload the file
    const { data, error } = await supabaseClient.storage
      .from("user-content")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading cover image:", error.message);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabaseClient.storage
      .from("user-content")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadCoverImage:", error);
    return null;
  }
}

/**
 * Uploads a content image to Supabase storage (for luxicle content)
 * @param supabaseClient - The Supabase client instance
 * @param userId - The user ID
 * @param file - The image file to upload
 * @returns The URL of the uploaded content image or null if upload fails
 */
export async function uploadContentImage(
  supabaseClient: SupabaseClient,
  userId: string,
  file: File
): Promise<string | null> {
  try {
    // Generate a unique filename with the original extension
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${uuidv4()}.${fileExt}`;
    const filePath = `content/${fileName}`;

    // Upload the file
    const { data, error } = await supabaseClient.storage
      .from("user-content")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading content image:", error.message);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabaseClient.storage
      .from("user-content")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadContentImage:", error);
    return null;
  }
}

/**
 * Deletes a file from Supabase storage
 * @param supabaseClient - The Supabase client instance
 * @param url - The full URL of the file to delete
 * @returns Boolean indicating success or failure
 */
export async function deleteFile(
  supabaseClient: SupabaseClient,
  url: string
): Promise<boolean> {
  try {
    // Extract the path from the URL
    const bucketName = "user-content";
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(new RegExp(`/${bucketName}/(.*)`));
    
    if (!pathMatch || !pathMatch[1]) {
      console.error("Invalid file URL format");
      return false;
    }
    
    const filePath = pathMatch[1];
    
    // Delete the file
    const { error } = await supabaseClient.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error("Error deleting file:", error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteFile:", error);
    return false;
  }
}

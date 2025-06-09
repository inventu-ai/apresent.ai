"use server";

import { auth } from "@/server/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateUserAvatar(userId: string, imageUrl: string) {
  const session = await auth();
  
  if (!session?.user || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ image: imageUrl, updatedAt: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user avatar:', error);
      throw new Error("Failed to update avatar");
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw new Error("Failed to update avatar");
  }
}

export async function updateUserProfile(userId: string, data: {
  name?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  interests?: string[];
  language?: string;
}) {
  const session = await auth();
  
  if (!session?.user || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    const { error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      throw new Error("Failed to update profile");
    }

    // Force revalidation of all pages to update session data
    revalidatePath('/', 'layout');
    revalidatePath('/profile');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error("Failed to update profile");
  }
}

export async function updateNotificationSettings(userId: string, settings: {
  emailIntegration?: boolean;
  emailUpdates?: boolean;
}) {
  const session = await auth();
  
  if (!session?.user || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    // For now, we'll store notification settings in the user's bio field as JSON
    // In a real app, you'd want a separate notifications table
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('bio')
      .eq('id', userId)
      .single();

    let currentSettings = {};
    try {
      if (user?.bio) {
        const parsed = JSON.parse(user.bio);
        if (parsed.notifications) {
          currentSettings = parsed.notifications;
        }
      }
    } catch {
      // If bio is not JSON, ignore
    }

    const updatedSettings = {
      ...currentSettings,
      ...settings
    };

    const bioData = {
      notifications: updatedSettings
    };

    const { error } = await supabaseAdmin
      .from('users')
      .update({ 
        bio: JSON.stringify(bioData),
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating notification settings:', error);
      throw new Error("Failed to update notification settings");
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw new Error("Failed to update notification settings");
  }
}

export async function getUserProfile(userId: string) {
  const session = await auth();
  
  if (!session?.user || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, image, language')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw new Error("Failed to fetch profile");
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new Error("Failed to fetch profile");
  }
}

export async function deleteUserAccount(userId: string) {
  const session = await auth();
  
  if (!session?.user || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Delete user account (this will cascade delete all related data due to foreign key constraints)
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user account:', error);
      throw new Error("Failed to delete account");
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    throw new Error("Failed to delete account");
  }
}

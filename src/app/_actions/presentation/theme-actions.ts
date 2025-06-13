"use server";

import { auth } from "@/server/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";
import { utapi } from "@/app/api/uploadthing/core";
import { randomUUID } from "crypto";

// Schema for creating/updating a theme
const themeSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  themeData: z.any(), // We'll validate this as ThemeProperties in the function
  logoUrl: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

export type ThemeFormData = z.infer<typeof themeSchema>;

// Create a new custom theme
export async function createCustomTheme(formData: ThemeFormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be signed in to create a theme",
      };
    }

    const validatedData = themeSchema.parse(formData);

    const { data: newTheme, error } = await supabaseAdmin
      .from('CustomTheme')
      .insert({
        id: randomUUID(),
        name: validatedData.name,
        description: validatedData.description,
        themeData: validatedData.themeData,
        logoUrl: validatedData.logoUrl,
        isPublic: validatedData.isPublic,
        userId: session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating custom theme:", error);
      return {
        success: false,
        message: "Database error. Please try again later.",
      };
    }

    return {
      success: true,
      themeId: newTheme.id,
      message: "Theme created successfully",
    };
  } catch (error) {
    console.error("Failed to create custom theme:", error);

    // Log the actual error but return a generic message
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid theme data. Please check your inputs and try again.",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }
  }
}

// Update an existing custom theme
export async function updateCustomTheme(
  themeId: string,
  formData: ThemeFormData,
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be signed in to update a theme",
      };
    }

    const validatedData = themeSchema.parse(formData);

    // Verify ownership
    const { data: existingTheme, error: fetchError } = await supabaseAdmin
      .from('CustomTheme')
      .select('userId')
      .eq('id', themeId)
      .single();

    if (fetchError) {
      console.error("Error fetching theme:", fetchError);
      return { success: false, message: "Theme not found" };
    }

    if (existingTheme.userId !== session.user.id) {
      return { success: false, message: "Not authorized to update this theme" };
    }

    const { error: updateError } = await supabaseAdmin
      .from('CustomTheme')
      .update({
        name: validatedData.name,
        description: validatedData.description,
        themeData: validatedData.themeData,
        logoUrl: validatedData.logoUrl,
        isPublic: validatedData.isPublic,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', themeId);

    if (updateError) {
      console.error("Error updating theme:", updateError);
      return {
        success: false,
        message: "Database error. Please try again later.",
      };
    }

    return {
      success: true,
      message: "Theme updated successfully",
    };
  } catch (error) {
    console.error("Failed to update custom theme:", error);

    // Log the actual error but return a generic message
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid theme data. Please check your inputs and try again.",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }
  }
}

// Delete a custom theme
export async function deleteCustomTheme(themeId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be signed in to delete a theme",
      };
    }

    // Verify ownership and get theme data
    const { data: existingTheme, error: fetchError } = await supabaseAdmin
      .from('CustomTheme')
      .select('userId, logoUrl')
      .eq('id', themeId)
      .single();

    if (fetchError) {
      console.error("Error fetching theme:", fetchError);
      return { success: false, message: "Theme not found" };
    }

    if (existingTheme.userId !== session.user.id) {
      return { success: false, message: "Not authorized to delete this theme" };
    }

    // Delete logo from uploadthing if exists
    if (existingTheme.logoUrl) {
      try {
        const fileKey = existingTheme.logoUrl.split("/").pop();
        if (fileKey) {
          await utapi.deleteFiles(fileKey);
        }
      } catch (deleteError) {
        console.error("Failed to delete theme logo:", deleteError);
        // Continue with theme deletion even if logo deletion fails
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from('CustomTheme')
      .delete()
      .eq('id', themeId);

    if (deleteError) {
      console.error("Error deleting theme:", deleteError);
      return {
        success: false,
        message: "Database error. Please try again later.",
      };
    }

    return {
      success: true,
      message: "Theme deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete custom theme:", error);
    return {
      success: false,
      message:
        "Something went wrong while deleting the theme. Please try again later.",
    };
  }
}

// Get all custom themes for the current user
export async function getUserCustomThemes() {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be signed in to view your themes",
        themes: [],
      };
    }

    const { data: themes, error } = await supabaseAdmin
      .from('CustomTheme')
      .select('*')
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error("Error fetching custom themes:", error);
      return {
        success: false,
        message: "Unable to load themes at this time. Please try again later.",
        themes: [],
      };
    }

    return {
      success: true,
      themes: themes || [],
    };
  } catch (error) {
    console.error("Failed to fetch custom themes:", error);
    return {
      success: false,
      message: "Unable to load themes at this time. Please try again later.",
      themes: [],
    };
  }
}



// Get a single theme by ID
export async function getCustomThemeById(themeId: string) {
  try {
    // Check if themeId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(themeId)) {
      // If it's not a valid UUID, it's probably a predefined theme name like "default"
      return { 
        success: false, 
        message: "Invalid theme ID format - not a custom theme" 
      };
    }

    const { data: theme, error } = await supabaseAdmin
      .from('CustomTheme')
      .select(`
        *,
        user:users(name)
      `)
      .eq('id', themeId)
      .single();

    if (error) {
      console.error("Error fetching theme:", error);
      return { success: false, message: "Theme not found" };
    }

    return {
      success: true,
      theme,
    };
  } catch (error) {
    console.error("Failed to fetch theme:", error);
    return {
      success: false,
      message: "Unable to load the theme at this time. Please try again later.",
    };
  }
}

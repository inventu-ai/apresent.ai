"use server";

import { auth } from "@/server/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function addToFavorites(documentId: string) {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Check if already favorited
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('FavoriteDocument')
      .select('id')
      .eq('documentId', documentId)
      .eq('userId', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking existing favorite:", checkError);
      return { error: "Failed to check favorites" };
    }

    if (existing) {
      return { error: "Document is already in favorites" };
    }

    // Add to favorites
    const { error: insertError } = await supabaseAdmin
      .from('FavoriteDocument')
      .insert({
        id: randomUUID(),
        documentId,
        userId,
        createdAt: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error adding to favorites:", insertError);
      return { error: "Failed to add to favorites" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return { error: "Failed to add to favorites" };
  }
}

export async function removeFromFavorites(documentId: string) {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const { error } = await supabaseAdmin
      .from('FavoriteDocument')
      .delete()
      .eq('documentId', documentId)
      .eq('userId', userId);

    if (error) {
      console.error("Error removing from favorites:", error);
      return { error: "Failed to remove from favorites" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return { error: "Failed to remove from favorites" };
  }
}

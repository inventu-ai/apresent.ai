"use server";

import { type PlateSlide } from "@/components/presentation/utils/parser";
import { auth } from "@/server/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function createPresentation(
  content: {
    slides: PlateSlide[];
  },
  title: string,
  theme = "default",
  outline?: string[],
  imageModel?: string,
  presentationStyle?: string,
  language?: string
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  try {
    // Create BaseDocument first
    const baseDocId = randomUUID();
    const { data: baseDocument, error: baseError } = await supabaseAdmin
      .from('BaseDocument')
      .insert({
        id: baseDocId,
        type: "PRESENTATION",
        documentType: "presentation",
        title: title ?? "Untitled Presentation",
        userId,
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (baseError) {
      console.error('Error creating BaseDocument:', baseError);
      throw baseError;
    }

    // Create Presentation (using the same ID as BaseDocument)
    const { data: presentation, error: presentationError } = await supabaseAdmin
      .from('Presentation')
      .insert({
        id: baseDocId, // Same ID as BaseDocument
        content: content,
        theme: theme,
        imageModel,
        presentationStyle,
        language,
        outline: outline,
      })
      .select()
      .single();

    if (presentationError) {
      console.error('Error creating Presentation:', presentationError);
      // Cleanup: delete the base document if presentation creation failed
      await supabaseAdmin.from('BaseDocument').delete().eq('id', baseDocId);
      throw presentationError;
    }

    return {
      success: true,
      message: "Presentation created successfully",
      presentation: {
        ...baseDocument,
        presentation: presentation,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to create presentation",
    };
  }
}

export async function createEmptyPresentation(
  title: string,
  theme = "default"
) {
  const emptyContent: { slides: PlateSlide[] } = { slides: [] };

  return createPresentation(emptyContent, title, theme);
}

export async function updatePresentation({
  id,
  content,
  title,
  theme,
  outline,
  imageModel,
  presentationStyle,
  language,
}: {
  id: string;
  content?: {
    slides: PlateSlide[];
  };
  title?: string;
  theme?: string;
  outline?: string[];
  imageModel?: string;
  presentationStyle?: string;
  language?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Update BaseDocument if title is provided
    if (title !== undefined) {
      const { error: baseError } = await supabaseAdmin
        .from('BaseDocument')
        .update({
          title,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('userId', session.user.id);

      if (baseError) {
        console.error('Error updating BaseDocument:', baseError);
        throw baseError;
      }
    }

    // Update Presentation
    const updateData: any = {};

    if (content !== undefined) updateData.content = content;
    if (theme !== undefined) updateData.theme = theme;
    if (outline !== undefined) updateData.outline = outline;
    if (imageModel !== undefined) updateData.imageModel = imageModel;
    if (presentationStyle !== undefined) updateData.presentationStyle = presentationStyle;
    if (language !== undefined) updateData.language = language;

    const { data: presentation, error: presentationError } = await supabaseAdmin
      .from('Presentation')
      .update(updateData)
      .eq('id', id) // Use id instead of baseDocumentId
      .select()
      .single();

    if (presentationError) {
      console.error('Error updating Presentation:', presentationError);
      throw presentationError;
    }

    // Get the updated BaseDocument
    const { data: baseDocument, error: baseDocError } = await supabaseAdmin
      .from('BaseDocument')
      .select('*')
      .eq('id', id)
      .single();

    if (baseDocError) {
      console.error('Error fetching BaseDocument:', baseDocError);
      throw baseDocError;
    }

    return {
      success: true,
      message: "Presentation updated successfully",
      presentation: {
        ...baseDocument,
        presentation: presentation,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update presentation",
    };
  }
}

export async function updatePresentationTitle(id: string, title: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const { data: baseDocument, error: baseError } = await supabaseAdmin
      .from('BaseDocument')
      .update({
        title,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('userId', session.user.id)
      .select()
      .single();

    if (baseError) {
      console.error('Error updating BaseDocument title:', baseError);
      throw baseError;
    }

    // Get the presentation data
    const { data: presentation, error: presentationError } = await supabaseAdmin
      .from('Presentation')
      .select('*')
      .eq('id', id) // Use id instead of baseDocumentId
      .single();

    if (presentationError) {
      console.error('Error fetching Presentation:', presentationError);
      throw presentationError;
    }

    return {
      success: true,
      message: "Presentation title updated successfully",
      presentation: {
        ...baseDocument,
        presentation: presentation,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update presentation title",
    };
  }
}

export async function deletePresentation(id: string) {
  return deletePresentations([id]);
}

export async function deletePresentations(ids: string[]) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Delete the base documents (this will cascade delete the presentations due to foreign key constraints)
    const { data: deletedDocs, error } = await supabaseAdmin
      .from('BaseDocument')
      .delete()
      .in('id', ids)
      .eq('userId', session.user.id)
      .select('id');

    if (error) {
      console.error('Error deleting presentations:', error);
      throw error;
    }

    const deletedCount = deletedDocs?.length || 0;
    const failedCount = ids.length - deletedCount;

    if (failedCount > 0) {
      return {
        success: deletedCount > 0,
        message:
          deletedCount > 0
            ? `Deleted ${deletedCount} presentations, failed to delete ${failedCount} presentations`
            : "Failed to delete presentations",
        partialSuccess: deletedCount > 0,
      };
    }

    return {
      success: true,
      message:
        ids.length === 1
          ? "Presentation deleted successfully"
          : `${deletedCount} presentations deleted successfully`,
    };
  } catch (error) {
    console.error("Failed to delete presentations:", error);
    return {
      success: false,
      message: "Failed to delete presentations",
    };
  }
}

// Get the presentation with the presentation content
export async function getPresentation(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get BaseDocument
    const { data: baseDocument, error: baseError } = await supabaseAdmin
      .from('BaseDocument')
      .select('*')
      .eq('id', id)
      .single();

    if (baseError) {
      console.error('Error fetching BaseDocument:', baseError);
      throw baseError;
    }

    // Get Presentation
    const { data: presentation, error: presentationError } = await supabaseAdmin
      .from('Presentation')
      .select('*')
      .eq('id', id) // Use id instead of baseDocumentId
      .single();

    if (presentationError) {
      console.error('Error fetching Presentation:', presentationError);
      throw presentationError;
    }

    return {
      success: true,
      presentation: {
        ...baseDocument,
        presentation: presentation,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch presentation",
    };
  }
}

export async function getPresentationContent(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get BaseDocument to check permissions
    const { data: baseDocument, error: baseError } = await supabaseAdmin
      .from('BaseDocument')
      .select('userId, isPublic')
      .eq('id', id)
      .single();

    if (baseError) {
      console.error('Error fetching BaseDocument:', baseError);
      return {
        success: false,
        message: "Presentation not found",
      };
    }

    // Check if the user has access to this presentation
    if (baseDocument.userId !== session.user.id && !baseDocument.isPublic) {
      return {
        success: false,
        message: "Unauthorized access",
      };
    }

    // Get Presentation content
    const { data: presentation, error: presentationError } = await supabaseAdmin
      .from('Presentation')
      .select('id, content, theme, outline')
      .eq('id', id) // Use id instead of baseDocumentId
      .single();

    if (presentationError) {
      console.error('Error fetching Presentation content:', presentationError);
      throw presentationError;
    }

    return {
      success: true,
      presentation: presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch presentation",
    };
  }
}

export async function updatePresentationTheme(id: string, theme: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const { data: presentation, error } = await supabaseAdmin
      .from('Presentation')
      .update({
        theme,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating presentation theme:', error);
      throw error;
    }

    return {
      success: true,
      message: "Presentation theme updated successfully",
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update presentation theme",
    };
  }
}

export async function duplicatePresentation(id: string, newTitle?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the original BaseDocument
    const { data: originalBase, error: baseError } = await supabaseAdmin
      .from('BaseDocument')
      .select('*')
      .eq('id', id)
      .single();

    if (baseError) {
      console.error('Error fetching original BaseDocument:', baseError);
      return {
        success: false,
        message: "Original presentation not found",
      };
    }

    // Get the original Presentation
    const { data: originalPresentation, error: presentationError } = await supabaseAdmin
      .from('Presentation')
      .select('*')
      .eq('id', id) // Use id instead of baseDocumentId
      .single();

    if (presentationError) {
      console.error('Error fetching original Presentation:', presentationError);
      return {
        success: false,
        message: "Original presentation not found",
      };
    }

    // Create new BaseDocument
    const newBaseDocId = randomUUID();
    const { data: newBaseDocument, error: newBaseError } = await supabaseAdmin
      .from('BaseDocument')
      .insert({
        id: newBaseDocId,
        type: "PRESENTATION",
        documentType: "presentation",
        title: newTitle ?? `${originalBase.title} (Copy)`,
        userId: session.user.id,
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (newBaseError) {
      console.error('Error creating new BaseDocument:', newBaseError);
      throw newBaseError;
    }

    // Create new Presentation (using the same ID as BaseDocument)
    const { data: newPresentation, error: newPresentationError } = await supabaseAdmin
      .from('Presentation')
      .insert({
        id: newBaseDocId, // Same ID as BaseDocument
        content: originalPresentation.content,
        theme: originalPresentation.theme,
        imageModel: originalPresentation.imageModel,
        presentationStyle: originalPresentation.presentationStyle,
        language: originalPresentation.language,
        outline: originalPresentation.outline,
      })
      .select()
      .single();

    if (newPresentationError) {
      console.error('Error creating new Presentation:', newPresentationError);
      // Cleanup: delete the base document if presentation creation failed
      await supabaseAdmin.from('BaseDocument').delete().eq('id', newBaseDocId);
      throw newPresentationError;
    }

    return {
      success: true,
      message: "Presentation duplicated successfully",
      presentation: {
        ...newBaseDocument,
        presentation: newPresentation,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to duplicate presentation",
    };
  }
}

"use server";
import "server-only";

import { auth } from "@/server/auth";
import { supabaseAdmin } from "@/lib/supabase";

export type PresentationDocument = {
  id: string;
  type: string;
  documentType: string;
  title: string;
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  presentation: {
    id: string;
    content: any;
    theme: string;
    imageModel?: string;
    presentationStyle?: string;
    language?: string;
    outline?: string[];
  };
  user?: {
    name: string;
    image: string;
  };
};

const ITEMS_PER_PAGE = 10;

export async function fetchPresentations(page = 0) {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    return {
      items: [],
      hasMore: false,
    };
  }

  const skip = page * ITEMS_PER_PAGE;

  try {
    // Get BaseDocuments with Presentations
    const { data: baseDocuments, error } = await supabaseAdmin
      .from('BaseDocument')
      .select(`
        *,
        presentation:Presentation(*)
      `)
      .eq('userId', userId)
      .eq('type', 'PRESENTATION')
      .order('updatedAt', { ascending: false })
      .range(skip, skip + ITEMS_PER_PAGE - 1);

    if (error) {
      console.error('Error fetching presentations:', error);
      return {
        items: [],
        hasMore: false,
      };
    }

    const items = baseDocuments || [];
    const hasMore = items.length === ITEMS_PER_PAGE;

    return {
      items,
      hasMore,
    };
  } catch (error) {
    console.error('Error in fetchPresentations:', error);
    return {
      items: [],
      hasMore: false,
    };
  }
}

export async function fetchPublicPresentations(page = 0) {
  const skip = page * ITEMS_PER_PAGE;

  try {
    // Get public presentations with user info
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('BaseDocument')
      .select(`
        *,
        presentation:Presentation(*),
        user:users(name, image)
      `)
      .eq('type', 'PRESENTATION')
      .eq('isPublic', true)
      .order('updatedAt', { ascending: false })
      .range(skip, skip + ITEMS_PER_PAGE - 1);

    if (itemsError) {
      console.error('Error fetching public presentations:', itemsError);
      return {
        items: [],
        hasMore: false,
      };
    }

    // Get total count for pagination
    const { count: total, error: countError } = await supabaseAdmin
      .from('BaseDocument')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'PRESENTATION')
      .eq('isPublic', true);

    if (countError) {
      console.error('Error counting public presentations:', countError);
    }

    const hasMore = skip + ITEMS_PER_PAGE < (total || 0);

    return {
      items: items || [],
      hasMore,
    };
  } catch (error) {
    console.error('Error in fetchPublicPresentations:', error);
    return {
      items: [],
      hasMore: false,
    };
  }
}

export async function fetchUserPresentations(userId: string, page = 0) {
  const session = await auth();
  const currentUserId = session?.user.id;

  const skip = page * ITEMS_PER_PAGE;

  try {
    // Build the query conditions
    let query = supabaseAdmin
      .from('BaseDocument')
      .select(`
        *,
        presentation:Presentation(*)
      `)
      .eq('userId', userId)
      .eq('type', 'PRESENTATION');

    // If not viewing own presentations, only show public ones
    if (currentUserId !== userId) {
      query = query.eq('isPublic', true);
    }

    const { data: items, error: itemsError } = await query
      .order('updatedAt', { ascending: false })
      .range(skip, skip + ITEMS_PER_PAGE - 1);

    if (itemsError) {
      console.error('Error fetching user presentations:', itemsError);
      return {
        items: [],
        hasMore: false,
      };
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('BaseDocument')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId)
      .eq('type', 'PRESENTATION');

    if (currentUserId !== userId) {
      countQuery = countQuery.eq('isPublic', true);
    }

    const { count: total, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting user presentations:', countError);
    }

    const hasMore = skip + ITEMS_PER_PAGE < (total || 0);

    return {
      items: items || [],
      hasMore,
    };
  } catch (error) {
    console.error('Error in fetchUserPresentations:', error);
    return {
      items: [],
      hasMore: false,
    };
  }
}

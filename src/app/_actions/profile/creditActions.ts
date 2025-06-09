"use server";

import { auth } from "@/server/auth";
import { getCreditResetHistory } from "@/lib/credit-system";

export async function getCreditResetHistoryAction(limit = 10) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await getCreditResetHistory(session.user.id, limit);
    return result;
  } catch (error) {
    console.error('Error getting credit reset history:', error);
    return {
      success: false,
      history: [],
      message: 'Erro ao buscar histórico'
    };
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { canCreateCards } from "@/lib/credit-system";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Garantir que o userId seja uma string válida
    const userId = String(session.user.id).trim();
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Verificar limites para 1 card (só para obter informações do plano)
    const cardLimits = await canCreateCards(userId, 1);
    
    return NextResponse.json({
      maxCards: cardLimits.maxCards || 10,
      planName: cardLimits.planName || 'FREE',
    });
  } catch (error) {
    console.error("Error fetching plan limits:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch plan limits",
        maxCards: 10,
        planName: 'FREE'
      },
      { status: 500 }
    );
  }
}

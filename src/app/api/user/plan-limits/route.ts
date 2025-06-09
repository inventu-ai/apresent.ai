import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { canCreateCards } from "@/lib/credit-system";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar limites para 1 card (só para obter informações do plano)
    const cardLimits = await canCreateCards(session.user.id, 1);
    
    return NextResponse.json({
      maxCards: cardLimits.maxCards,
      planName: cardLimits.planName,
    });
  } catch (error) {
    console.error("Error fetching plan limits:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan limits" },
      { status: 500 }
    );
  }
}

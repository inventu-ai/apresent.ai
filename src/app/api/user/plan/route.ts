import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getUserCurrentPlan } from "@/lib/plan-checker";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar plano atual do usuário
    const plan = await getUserCurrentPlan(session.user.id);

    if (!plan) {
      // Fallback para FREE se não encontrar plano
      return NextResponse.json({
        planName: 'FREE',
        planDisplayName: 'Gratuito',
        planId: null
      });
    }

    return NextResponse.json({
      planName: plan.name,
      planDisplayName: plan.displayName || plan.name,
      planId: plan.id,
      price: plan.price || 0
    });

  } catch (error) {
    console.error("Erro ao buscar plano do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

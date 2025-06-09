import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { canUseImageQuality } from "@/lib/credit-system";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar qualidade básica para obter informações do plano
    const qualityOptions = await canUseImageQuality(session.user.id, 'BASIC_IMAGE');
    
    return NextResponse.json({
      availableQualities: qualityOptions.availableQualities,
      planName: qualityOptions.planName,
    });
  } catch (error) {
    console.error("Error fetching image quality options:", error);
    return NextResponse.json(
      { error: "Failed to fetch image quality options" },
      { status: 500 }
    );
  }
}

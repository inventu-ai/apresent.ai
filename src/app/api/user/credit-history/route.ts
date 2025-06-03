import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getCreditResetHistory } from "@/lib/credit-system";

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const history = await getCreditResetHistory(session.user.id, limit);
    
    if (!history.success) {
      return NextResponse.json(
        { error: history.message || "Failed to fetch credit history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      history: history.history
    });
  } catch (error) {
    console.error("Error fetching credit history:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit history" },
      { status: 500 }
    );
  }
}

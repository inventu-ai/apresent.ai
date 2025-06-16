import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { canExecuteAction } from "@/lib/credit-system";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const result = await canExecuteAction(session.user.id, action);

    return NextResponse.json({
      allowed: result.allowed,
      cost: result.cost,
      currentCredits: result.currentCredits,
      message: result.message,
    });
  } catch (error) {
    console.error("Error checking credits:", error);
    return NextResponse.json(
      { error: "Failed to check credits" },
      { status: 500 }
    );
  }
} 
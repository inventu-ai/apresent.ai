import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { getUserCurrentPlan } from '@/lib/plan-checker';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Garantir que o userId seja uma string válida
    const sessionUserId = String(session.user.id).trim();
    const requestUserId = userId ? String(userId).trim() : '';

    // Verify the userId matches the authenticated user
    if (requestUserId && requestUserId !== sessionUserId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user plan from server-side function
    const plan = await getUserCurrentPlan(sessionUserId);
    const planName = plan?.name || 'FREE';

    return NextResponse.json({
      plan: planName,
      success: true
    });

  } catch (error) {
    console.error('Error fetching user plan:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        plan: 'FREE' // Default fallback
      },
      { status: 500 }
    );
  }
}

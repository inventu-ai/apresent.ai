"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface PlanBadgeData {
  planName: 'FREE' | 'PRO' | 'PREMIUM';
  planDisplayName: string;
  isLoading: boolean;
  error: string | null;
}

export function usePlanBadge(): PlanBadgeData {
  const { data: session } = useSession();
  const [planData, setPlanData] = useState<PlanBadgeData>({
    planName: 'FREE',
    planDisplayName: 'Gratuito',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    async function fetchUserPlan() {
      if (!session?.user?.id) {
        setPlanData({
          planName: 'FREE',
          planDisplayName: 'Gratuito',
          isLoading: false,
          error: null
        });
        return;
      }

      try {
        const response = await fetch(`/api/user/plan?userId=${session.user.id}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar plano do usuário');
        }

        const data = await response.json();
        
        setPlanData({
          planName: data.plan || 'FREE',
          planDisplayName: data.plan === 'PREMIUM' ? 'Premium' : data.plan === 'PRO' ? 'Pro' : 'Gratuito',
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erro ao buscar plano:', error);
        setPlanData({
          planName: 'FREE',
          planDisplayName: 'Gratuito',
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    fetchUserPlan();
  }, [session?.user?.id]);

  return planData;
}

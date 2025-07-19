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
        // Garantir que o userId seja uma string válida
        const userId = String(session.user.id).trim();
        if (!userId) {
          throw new Error('ID do usuário inválido');
        }

        const response = await fetch(`/api/user/plan?userId=${encodeURIComponent(userId)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
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

    // Adicionar um pequeno delay para evitar múltiplas chamadas simultâneas
    const timeoutId = setTimeout(() => {
      void fetchUserPlan();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [session?.user?.id]);

  return planData;
}

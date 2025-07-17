"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type PlanType = 'FREE' | 'PRO' | 'PREMIUM';

export function useUserPlan() {
  const { data: session } = useSession();
  const [currentPlan, setCurrentPlan] = useState<PlanType>('FREE');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
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
          // If unauthorized, still set to FREE instead of erroring
          if (response.status === 401 || response.status === 403) {
            setCurrentPlan('FREE');
            setIsLoading(false);
            return;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCurrentPlan((data.plan as PlanType) || 'FREE');
      } catch (err) {
        console.error('Error fetching user plan:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setCurrentPlan('FREE'); // Default to FREE on error
      } finally {
        setIsLoading(false);
      }
    };

    // Adicionar um pequeno delay para evitar múltiplas chamadas simultâneas
    const timeoutId = setTimeout(fetchUserPlan, 150);
    return () => clearTimeout(timeoutId);
  }, [session?.user?.id]);

  return {
    currentPlan,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
      // Re-trigger the effect by updating a state
    }
  };
}

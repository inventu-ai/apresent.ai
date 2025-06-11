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
        // Create an API endpoint to get user plan instead of using direct supabase calls
        const response = await fetch(`/api/user/plan?userId=${session.user.id}`, {
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

    fetchUserPlan();
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
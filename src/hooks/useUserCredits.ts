"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserCredits {
  current: number;
  limit: number;
  isUnlimited: boolean;
  remaining: number;
  percentage: number;
  nextReset: Date | null;
  daysUntilReset: number;
  wasReset?: boolean;
  isAdmin?: boolean;
  loading: boolean;
  error?: string;
}

export function useUserCredits(): UserCredits {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<UserCredits>({
    current: 0,
    limit: 0,
    isUnlimited: false,
    remaining: 0,
    percentage: 0,
    nextReset: null,
    daysUntilReset: 0,
    loading: true,
  });

  const fetchUserCredits = async () => {
    try {
      setCredits(prev => ({ ...prev, loading: true, error: undefined }));
      
      const response = await fetch('/api/user/credits');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar créditos');
      }
      
      const data = await response.json();
      
      setCredits({
        current: data.current,
        limit: data.limit,
        isUnlimited: data.isUnlimited,
        remaining: data.remaining,
        percentage: data.percentage,
        nextReset: data.nextReset ? new Date(data.nextReset) : null,
        daysUntilReset: data.daysUntilReset,
        wasReset: data.wasReset,
        isAdmin: data.isAdmin,
        loading: false,
      });
    } catch (error) {
      setCredits(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  };

  useEffect(() => {
    if (!session?.user?.id) {
      setCredits(prev => ({ ...prev, loading: false }));
      return;
    }

    // Adicionar um pequeno delay para evitar múltiplas chamadas simultâneas
    const timeoutId = setTimeout(() => {
      void fetchUserCredits();
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [session?.user?.id]);

  return {
    ...credits,
    refetch: fetchUserCredits,
  } as UserCredits & { refetch: () => Promise<void> };
}

interface PlanLimits {
  maxCards: number;
  planName: string;
  loading: boolean;
  error?: string;
}

export function useUserPlanLimits(): PlanLimits {
  const { data: session } = useSession();
  const [limits, setLimits] = useState<PlanLimits>({
    maxCards: 10,
    planName: 'FREE',
    loading: true,
  });

  const fetchPlanLimits = async () => {
    try {
      setLimits(prev => ({ ...prev, loading: true, error: undefined }));
      
      const response = await fetch('/api/user/plan-limits', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setLimits({
        maxCards: data.maxCards || 10,
        planName: data.planName || 'FREE',
        loading: false,
      });
    } catch (error) {
      console.error('Erro ao buscar limites do plano:', error);
      setLimits(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  };

  useEffect(() => {
    if (!session?.user?.id) {
      setLimits(prev => ({ ...prev, loading: false }));
      return;
    }

    // Adicionar um pequeno delay para evitar múltiplas chamadas simultâneas
    const timeoutId = setTimeout(() => {
      void fetchPlanLimits();
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [session?.user?.id]);

  return limits;
}

interface ImageQualityOptions {
  availableQualities: string[];
  planName: string;
  loading: boolean;
  error?: string;
}

export function useImageQualityOptions(): ImageQualityOptions {
  const { data: session } = useSession();
  const [options, setOptions] = useState<ImageQualityOptions>({
    availableQualities: ['BASIC_IMAGE'],
    planName: 'FREE',
    loading: true,
  });

  const fetchImageQualityOptions = async () => {
    try {
      setOptions(prev => ({ ...prev, loading: true, error: undefined }));
      
      const response = await fetch('/api/user/image-quality-options');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar opções de qualidade');
      }
      
      const data = await response.json();
      
      setOptions({
        availableQualities: data.availableQualities,
        planName: data.planName,
        loading: false,
      });
    } catch (error) {
      setOptions(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  };

  useEffect(() => {
    if (!session?.user?.id) {
      setOptions(prev => ({ ...prev, loading: false }));
      return;
    }

    // Adicionar um pequeno delay para evitar múltiplas chamadas simultâneas
    const timeoutId = setTimeout(() => {
      void fetchImageQualityOptions();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [session?.user?.id]);

  return options;
}

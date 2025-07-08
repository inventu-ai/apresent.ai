"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  loading: boolean;
  error?: string;
}

interface CreditsContextType {
  credits: UserCredits;
  refetchCredits: () => Promise<void>;
}

const defaultCredits: UserCredits = {
  current: 0,
  limit: 0,
  isUnlimited: false,
  remaining: 0,
  percentage: 0,
  nextReset: null,
  daysUntilReset: 0,
  loading: true,
};

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<UserCredits>(defaultCredits);

  const fetchUserCredits = useCallback(async () => {
    if (!session?.user?.id) {
      setCredits(prev => ({ ...prev, loading: false }));
      return;
    }

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
        loading: false,
      });
    } catch (error) {
      setCredits(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  }, [session?.user?.id]);

  // Carregar créditos iniciais
  useEffect(() => {
    fetchUserCredits();
  }, [fetchUserCredits]);

  const value = {
    credits,
    refetchCredits: fetchUserCredits,
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}

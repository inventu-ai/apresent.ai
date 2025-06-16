import { useState } from "react";
import { useSession } from "next-auth/react";
import { useUserPlanLimits } from "./useUserCredits";

interface CreditCheckResult {
  allowed: boolean;
  cost: number;
  currentCredits: number;
  message?: string;
}

export function useCreditValidation() {
  const { data: session } = useSession();
  const { planName } = useUserPlanLimits();
  const [isChecking, setIsChecking] = useState(false);

  const checkCredits = async (action: string): Promise<CreditCheckResult> => {
    if (!session?.user?.id) {
      return {
        allowed: false,
        cost: 0,
        currentCredits: 0,
        message: "Usuário não autenticado"
      };
    }

    setIsChecking(true);
    
    try {
      const response = await fetch('/api/user/credits/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      
      return {
        allowed: data.allowed || false,
        cost: data.cost || 0,
        currentCredits: data.currentCredits || 0,
        message: data.message
      };
    } catch (error) {
      console.error("Error checking credits:", error);
      return {
        allowed: false,
        cost: 0,
        currentCredits: 0,
        message: "Erro ao verificar créditos"
      };
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkCredits,
    isChecking,
    userId: session?.user?.id || "",
    currentPlan: planName as 'FREE' | 'PRO' | 'PREMIUM'
  };
} 
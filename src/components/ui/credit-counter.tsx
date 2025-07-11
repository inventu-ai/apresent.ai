"use client";

import { useUserCredits } from "@/hooks/useUserCredits";
import { useUserPlan } from "@/hooks/useUserPlan";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Zap } from "lucide-react";

interface CreditCounterProps {
  className?: string;
  showDetails?: boolean;
}

export function CreditCounter({ className = "", showDetails = true }: CreditCounterProps) {
  const { current, limit, isUnlimited, remaining, percentage, nextReset, daysUntilReset, wasReset, isAdmin, loading, error } = useUserCredits();
  const { currentPlan } = useUserPlan();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-500 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Erro ao carregar créditos</span>
      </div>
    );
  }

  // 🔥 NOVA VERIFICAÇÃO: Exibição especial para ADMINs
  if (isAdmin) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Zap className="h-4 w-4 text-purple-500" />
        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">
          <span className="text-sm font-bold">👑 ADMIN</span>
        </Badge>
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
          <span className="text-xs">∞ Créditos Ilimitados</span>
        </Badge>
      </div>
    );
  }

  if (isUnlimited) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Zap className="h-4 w-4 text-yellow-500" />
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Créditos aumentados!
        </Badge>
      </div>
    );
  }

  const isLow = percentage > 80;
  const isCritical = percentage > 95;
  const isPremium = currentPlan === 'PREMIUM';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Zap className={`h-4 w-4 ${
          isPremium ? 'text-yellow-500' :
          isCritical ? 'text-red-500' : 
          isLow ? 'text-yellow-500' : 
          'text-blue-500'
        }`} />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Progress 
              value={percentage} 
              className={`w-24 h-2 ${
                isPremium ? '[&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:to-orange-500' :
                isCritical ? '[&>div]:bg-red-500' : 
                isLow ? '[&>div]:bg-yellow-500' : 
                '[&>div]:bg-blue-500'
              }`}
            />
            <span className={`text-sm font-medium ${
              isPremium ? 'text-yellow-600 font-semibold' :
              isCritical ? 'text-red-600' : 
              isLow ? 'text-yellow-600' : 
              'text-gray-600'
            }`}>
              {remaining}/{limit}
            </span>
          </div>
          {showDetails && (
            <div className="space-y-1">
              <span className="text-xs text-gray-500">
                {remaining} créditos restantes
              </span>
              {nextReset && (
                <div className="text-xs text-gray-400">
                  Reset em {daysUntilReset} {daysUntilReset === 1 ? 'dia' : 'dias'}
                </div>
              )}
              {wasReset && (
                <div className="text-xs text-green-600 font-medium">
                  ✨ Créditos resetados!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {isCritical && (
        <Badge variant="destructive" className="text-xs">
          Crítico
        </Badge>
      )}
      {isLow && !isCritical && (
        <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
          Baixo
        </Badge>
      )}
    </div>
  );
}

interface CreditCostDisplayProps {
  action: string;
  cost: number;
  className?: string;
}

export function CreditCostDisplay({ action, cost, className = "" }: CreditCostDisplayProps) {
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'PRESENTATION_CREATION': return 'Criar Apresentação';
      case 'BASIC_IMAGE': return 'Imagem Básica';
      case 'ADVANCED_IMAGE': return 'Imagem Avançada';
      case 'PREMIUM_IMAGE': return 'Imagem Premium';
      case 'TEXT_GENERATION': return 'Geração de Texto';
      case 'SLIDE_CREATION': return 'Criação de Slide';
      default: return action;
    }
  };

  return (
    <div className={`flex items-center gap-1 text-sm text-gray-600 ${className}`}>
      <Zap className="h-3 w-3" />
      <span>{cost} créditos - {getActionLabel(action)}</span>
    </div>
  );
}

interface CreditWarningProps {
  remainingCredits: number;
  requiredCredits: number;
  className?: string;
}

export function CreditWarning({ remainingCredits, requiredCredits, className = "" }: CreditWarningProps) {
  if (remainingCredits >= requiredCredits) {
    return null;
  }

  const deficit = requiredCredits - remainingCredits;

  return (
    <div className={`flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <AlertCircle className="h-4 w-4 text-red-500" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">
          Créditos insuficientes
        </p>
        <p className="text-xs text-red-600">
          Você precisa de {requiredCredits} créditos, mas tem apenas {remainingCredits}. 
          Faltam {deficit} créditos.
        </p>
      </div>
    </div>
  );
}

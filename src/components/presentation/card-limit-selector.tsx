"use client";

import { useState } from "react";
import { useUserPlanLimits } from "@/hooks/useUserCredits";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Crown, Zap } from "lucide-react";

interface CardLimitSelectorProps {
  value?: number;
  onValueChange?: (value: number) => void;
  className?: string;
}

const CARD_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30];

export function CardLimitSelector({ value, onValueChange, className = "" }: CardLimitSelectorProps) {
  const { maxCards, planName, loading } = useUserPlanLimits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const getPlanForCards = (cardCount: number) => {
    if (cardCount <= 10) return 'FREE';
    if (cardCount <= 20) return 'PRO';
    return 'PREMIUM';
  };

  const getPlanBadge = (cardCount: number) => {
    const requiredPlan = getPlanForCards(cardCount);
    
    if (requiredPlan === 'FREE') return null;
    
    if (requiredPlan === 'PRO') {
      return (
        <Badge className="ml-auto text-xs bg-blue-600 text-white hover:bg-blue-700">
          PRO
        </Badge>
      );
    }
    
    return (
      <Badge className="ml-auto text-xs bg-purple-600 text-white hover:bg-purple-700">
        PREMIUM
      </Badge>
    );
  };

  const isCardCountAllowed = (cardCount: number) => {
    return cardCount <= maxCards;
  };

  const handleValueChange = (newValue: string) => {
    const cardCount = parseInt(newValue);
    
    if (!isCardCountAllowed(cardCount)) {
      setShowUpgradeModal(true);
      return;
    }
    
    onValueChange?.(cardCount);
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <>
      <Select value={value?.toString()} onValueChange={handleValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Selecione o número de cards" />
        </SelectTrigger>
        <SelectContent>
          {CARD_OPTIONS.map((cardCount) => {
            const isAllowed = isCardCountAllowed(cardCount);
            const requiredPlan = getPlanForCards(cardCount);
            
            return (
              <SelectItem
                key={cardCount}
                value={cardCount.toString()}
                disabled={!isAllowed}
                className={`flex items-center justify-between py-3 ${
                  !isAllowed ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {!isAllowed && <Lock className="h-3 w-3 text-gray-400" />}
                    <span className={!isAllowed ? 'text-gray-500' : 'text-gray-900'}>
                      {cardCount} {cardCount === 1 ? 'cartão' : 'cartões'}
                    </span>
                  </div>
                  {getPlanBadge(cardCount)}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Upgrade Necessário
            </DialogTitle>
            <DialogDescription>
              Para criar apresentações com mais cards, você precisa fazer upgrade do seu plano.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Seu plano atual: {planName}</h4>
              <p className="text-sm text-gray-600">
                Máximo de {maxCards} cards por apresentação
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h5 className="font-medium">Plano PRO</h5>
                  <p className="text-sm text-gray-600">Até 20 cards</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$9.99/mês</p>
                  <Badge variant="outline" className="text-xs">
                    Recomendado
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h5 className="font-medium">Plano PREMIUM</h5>
                  <p className="text-sm text-gray-600">Até 30 cards</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$19.99/mês</p>
                  <Badge variant="outline" className="text-xs border-purple-500 text-purple-600">
                    Completo
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  // Links de pagamento do Stripe
                  const stripeLinks = {
                    PRO: 'https://buy.stripe.com/3cI5kEbhE1Ma0pu4qrenS0y',
                    PREMIUM: 'https://buy.stripe.com/cNi8wQ2L8duS3BGe11enS0z'
                  };
                  
                  // Determinar qual plano é necessário baseado no plano atual
                  const targetPlan = planName === 'FREE' ? 'PRO' : 'PREMIUM';
                  window.open(stripeLinks[targetPlan], '_blank');
                  setShowUpgradeModal(false);
                }}
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface CardLimitInfoProps {
  className?: string;
}

export function CardLimitInfo({ className = "" }: CardLimitInfoProps) {
  const { maxCards, planName, loading } = useUserPlanLimits();

  if (loading) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
      <span>Seu plano {planName} permite até {maxCards} cards</span>
      {planName === 'FREE' && (
        <Badge variant="outline" className="text-xs">
          Upgrade para mais
        </Badge>
      )}
    </div>
  );
}

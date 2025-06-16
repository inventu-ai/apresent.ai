"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Zap, Clock, TrendingUp, Crown, Star } from "lucide-react";
import { PricingModal } from "@/app/profile/components/PricingModal";

interface InsufficientCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditsNeeded: number;
  currentCredits: number;
  actionName: string;
  currentPlan: 'FREE' | 'PRO' | 'PREMIUM';
  userId: string;
  nextReset?: Date;
}

export function InsufficientCreditsModal({
  open,
  onOpenChange,
  creditsNeeded,
  currentCredits,
  actionName,
  currentPlan,
  userId,
  nextReset,
}: InsufficientCreditsModalProps) {
  const [showPricingModal, setShowPricingModal] = useState(false);

  const daysUntilReset = nextReset 
    ? Math.ceil((nextReset.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 30;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Créditos Insuficientes
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status atual */}
            <Card>
              <CardHeader className="pb-3">
                <h4 className="font-medium text-center">Status Atual</h4>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ação:</span>
                  <span className="font-medium">{actionName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Necessário:</span>
                  <Badge variant="destructive">{creditsNeeded} créditos</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Disponível:</span>
                  <Badge variant="outline">{currentCredits} créditos</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Faltam:</span>
                  <Badge variant="secondary">{creditsNeeded - currentCredits} créditos</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Opções */}
            <div className="space-y-3">
              <h4 className="font-medium text-center">O que você pode fazer:</h4>
              
              {/* Opção 1: Aguardar reset */}
              {currentPlan !== 'PREMIUM' && (
                <Card className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">Aguardar próximo mês</h5>
                        <p className="text-xs text-muted-foreground">
                          Seus créditos serão renovados em {daysUntilReset} dias
                          {nextReset && ` (${formatDate(nextReset)})`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Opção 2: Fazer upgrade */}
              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">Fazer upgrade do plano</h5>
                      <p className="text-xs text-muted-foreground">
                        {currentPlan === 'FREE' 
                          ? 'Plano Pro: 2.000 créditos/mês'
                          : currentPlan === 'PRO'
                          ? 'Plano Premium: Créditos ilimitados'
                          : 'Você já tem o melhor plano!'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Entendi
              </Button>
              {currentPlan !== 'PREMIUM' && (
                <Button 
                  onClick={() => {
                    onOpenChange(false);
                    setShowPricingModal(true);
                  }}
                  className="flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Fazer Upgrade
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pricing Modal */}
      <PricingModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
        currentPlan={currentPlan}
        userId={userId}
      />
    </>
  );
} 
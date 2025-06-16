"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Zap, Clock, TrendingUp, Crown, Star } from "lucide-react";
import { PricingModal } from "@/app/profile/components/PricingModal";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t, language } = useLanguage();

  const daysUntilReset = nextReset 
    ? Math.ceil((nextReset.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 30;

  const formatDate = (date: Date) => {
    const locale = language === 'pt-BR' ? 'pt-BR' : language === 'en-US' ? 'en-US' : 'es-ES';
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPlanUpgradeText = () => {
    if (currentPlan === 'FREE') {
      return t.presentation.creditsModal.freePlanCredits;
    } else if (currentPlan === 'PRO') {
      return t.presentation.creditsModal.proPlanCredits;
    } else {
      return t.presentation.creditsModal.premiumPlanCredits;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              {t.presentation.creditsModal.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status atual */}
            <Card>
              <CardHeader className="pb-3">
                <h4 className="font-medium text-center">{t.presentation.creditsModal.currentStatus}</h4>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.presentation.creditsModal.action}:</span>
                  <span className="font-medium">{actionName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.presentation.creditsModal.required}:</span>
                  <Badge variant="destructive">{creditsNeeded} {t.presentation.creditsModal.credits}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.presentation.creditsModal.available}:</span>
                  <Badge variant="outline">{currentCredits} {t.presentation.creditsModal.credits}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.presentation.creditsModal.missing}:</span>
                  <Badge variant="secondary">{creditsNeeded - currentCredits} {t.presentation.creditsModal.credits}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Opções */}
            <div className="space-y-3">
              <h4 className="font-medium text-center">{t.presentation.creditsModal.whatYouCanDo}</h4>
              
              {/* Opção 1: Aguardar reset */}
              {currentPlan !== 'PREMIUM' && (
                <Card className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{t.presentation.creditsModal.waitNextMonth}</h5>
                        <p className="text-xs text-muted-foreground">
                          {t.presentation.creditsModal.creditsRenewIn} {daysUntilReset} {daysUntilReset === 1 ? t.userMenu.day : t.userMenu.days}
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
                      <h5 className="font-medium text-sm">{t.presentation.creditsModal.upgradeYourPlan}</h5>
                      <p className="text-xs text-muted-foreground">
                        {getPlanUpgradeText()}
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
                {t.presentation.creditsModal.understood}
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
                  {t.presentation.creditsModal.upgrade}
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
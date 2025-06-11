"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap, Clock, TrendingUp } from "lucide-react";
import { useUserCredits } from "@/hooks/useUserCredits";
import { PricingModal } from "./PricingModal";
import { PlanBadge } from "@/components/ui/plan-badge";
import { useTranslation } from "@/contexts/LanguageContext";

interface CreditSectionProps {
  userId: string;
  currentPlan?: 'FREE' | 'PRO' | 'PREMIUM';
}

export function CreditSection({ userId, currentPlan = 'FREE' }: CreditSectionProps) {
  const { remaining, limit, isUnlimited, percentage, daysUntilReset } = useUserCredits();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t.profile.yourCredits}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const used = limit - remaining;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t.profile.yourCredits}
          </div>
          <PlanBadge plan={currentPlan} size="sm" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {t.profile.manageAccount}
          </p>

          {isUnlimited ? (
            <div className="text-center py-4">
              <div className="text-2xl font-bold text-green-600">∞</div>
              <p className="text-sm text-muted-foreground">{t.profile.unlimitedCredits}</p>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{used}/{limit}</span>
                  <span className="text-muted-foreground">{percentage.toFixed(1)}% {t.profile.used}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>

              {/* Credits Info */}
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{remaining} {t.profile.creditsRemaining}</span>
              </div>

              {/* Reset Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{t.profile.resetIn} {daysUntilReset} dias</span>
              </div>
            </>
          )}

          {/* Upgrade Button - Mostrar apenas se não for PREMIUM */}
          {currentPlan !== 'PREMIUM' && (
            <div className="pt-2 border-t">
              <Button
                onClick={() => setShowPricingModal(true)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                {t.profile.upgradeCredits}
              </Button>
            </div>
          )}

          {/* Mensagem para usuários PREMIUM */}
          {currentPlan === 'PREMIUM' && (
            <div className="pt-2 border-t text-center">
              <p className="text-sm text-green-600 font-medium">
                🎉 {t.profile.youHaveMaxPlan}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Pricing Modal */}
      <PricingModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
        currentPlan={currentPlan}
        userId={userId}
      />
    </Card>
  );
}

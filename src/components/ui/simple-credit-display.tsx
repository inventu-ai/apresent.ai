"use client";

import { useState } from "react";
import { useUserCredits } from "@/hooks/useUserCredits";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Zap, CreditCard, Info } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PricingModal } from "@/app/profile/components/PricingModal";
import { Button } from "@/components/ui/button";

interface SimpleCreditDisplayProps {
  className?: string;
}

export function SimpleCreditDisplay({ className = "" }: SimpleCreditDisplayProps) {
  const { current, limit, isUnlimited, remaining, percentage, loading, error } = useUserCredits();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const { data: session } = useSession();
  const { currentPlan } = useUserPlan();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className="h-8 w-20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-500 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{t.credits.error}</span>
      </div>
    );
  }

  const isLow = percentage > 80;
  const isCritical = percentage > 95;

  // Determine a cor do texto com base na quantidade de créditos
  const textColorClass = isCritical 
    ? 'text-red-500' 
    : isLow 
      ? 'text-yellow-500' 
      : 'text-blue-500';

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div 
            className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent/50 ${className}`}
          >
            <Zap className={`h-4 w-4 ${textColorClass}`} />
            <span className={`text-base font-medium ${textColorClass}`}>
              {isUnlimited ? "∞" : remaining} {t.userMenu.credits}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <CreditInfoContent 
            remaining={remaining} 
            limit={limit} 
            percentage={percentage}
            isUnlimited={isUnlimited}
            onOpenPricing={() => setShowPricingModal(true)}
          />
        </PopoverContent>
      </Popover>

      {/* Pricing Modal */}
      {session?.user && (
        <PricingModal
          open={showPricingModal}
          onOpenChange={setShowPricingModal}
          currentPlan={currentPlan || 'FREE'}
          userId={session.user.id}
        />
      )}
    </>
  );
}

interface CreditInfoContentProps {
  remaining?: number;
  limit?: number;
  percentage?: number;
  isUnlimited: boolean;
  onOpenPricing?: () => void;
}

function CreditInfoContent({ remaining, limit, percentage, isUnlimited, onOpenPricing }: CreditInfoContentProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          <h4 className="font-semibold">{t.credits.accountBalance}</h4>
        </div>
        
        {isUnlimited ? (
          <div className="text-center py-2">
            <div className="text-2xl font-bold text-green-600">∞</div>
            <p className="text-sm text-muted-foreground">{t.credits.unlimitedCredits}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">{remaining} {t.userMenu.credits}</div>
            <p className="text-sm text-muted-foreground">
              {t.credits.creditsAllowAI}
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Credit Costs Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h5 className="font-medium">{t.credits.howManyCosts}</h5>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span>{t.credits.createPresentation}</span>
            <Badge variant="outline" className="text-xs">40 {t.userMenu.credits}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>{t.credits.generateImage}</span>
            <Badge variant="outline" className="text-xs">5 {t.userMenu.credits}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>{t.credits.editImage}</span>
            <Badge variant="outline" className="text-xs">20 {t.userMenu.credits}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>{t.credits.generateSlide}</span>
            <Badge variant="outline" className="text-xs">5 {t.userMenu.credits}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>{t.credits.regenerateTopic}</span>
            <Badge variant="outline" className="text-xs">2 {t.userMenu.credits}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>{t.credits.generateCard}</span>
            <Badge variant="outline" className="text-xs">2 {t.userMenu.credits}</Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h5 className="font-medium">{t.credits.howToGetMore}</h5>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {t.credits.unlimitedWithPlan}
        </p>

        <div className="flex flex-col gap-2">
          {!isUnlimited && (
            <Button 
              className="w-full" 
              onClick={onOpenPricing}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {t.credits.viewPlans}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useImageQualityOptions } from "@/hooks/useUserCredits";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCostDisplay } from "@/components/ui/credit-counter";
import { Lock, Crown, Zap, Image } from "lucide-react";
import { CREDIT_COSTS } from "@/lib/credit-system";

interface ImageQualitySelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const QUALITY_OPTIONS = [
  {
    value: 'BASIC_IMAGE',
    label: 'Básica',
    description: 'Qualidade padrão, rápida geração',
    cost: CREDIT_COSTS.BASIC_IMAGE,
    requiredPlan: 'FREE'
  },
  {
    value: 'ADVANCED_IMAGE',
    label: 'Avançada',
    description: 'Maior qualidade e detalhes',
    cost: CREDIT_COSTS.ADVANCED_IMAGE,
    requiredPlan: 'PRO'
  },
  {
    value: 'PREMIUM_IMAGE',
    label: 'Premium',
    description: 'Máxima qualidade e resolução',
    cost: CREDIT_COSTS.PREMIUM_IMAGE,
    requiredPlan: 'PREMIUM'
  }
];

export function ImageQualitySelector({ value, onValueChange, className = "" }: ImageQualitySelectorProps) {
  const { availableQualities, planName, loading } = useImageQualityOptions();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUnavailableQuality, setSelectedUnavailableQuality] = useState<string>('');

  const isQualityAvailable = (quality: string) => {
    return availableQualities.includes(quality);
  };

  const getPlanBadge = (requiredPlan: string) => {
    if (requiredPlan === 'FREE') return null;
    
    if (requiredPlan === 'PRO') {
      return (
        <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
          PRO
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-xs border-purple-500 text-purple-600">
        PREMIUM
      </Badge>
    );
  };

  const handleValueChange = (newValue: string) => {
    if (!isQualityAvailable(newValue)) {
      setSelectedUnavailableQuality(newValue);
      setShowUpgradeModal(true);
      return;
    }
    
    onValueChange?.(newValue);
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        <Label className="text-sm font-medium">Qualidade da Imagem</Label>
        <RadioGroup value={value} onValueChange={handleValueChange}>
          {QUALITY_OPTIONS.map((option) => {
            const isAvailable = isQualityAvailable(option.value);
            
            return (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                  isAvailable 
                    ? 'hover:bg-gray-50 cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed bg-gray-50'
                }`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  disabled={!isAvailable}
                  className={!isAvailable ? 'opacity-50' : ''}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={option.value}
                    className={`flex items-center gap-2 cursor-pointer ${
                      !isAvailable ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {!isAvailable && <Lock className="h-3 w-3" />}
                      <Image className="h-4 w-4" />
                      <span className="font-medium">{option.label}</span>
                      {getPlanBadge(option.requiredPlan)}
                    </div>
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                  <CreditCostDisplay 
                    action={option.value} 
                    cost={option.cost} 
                    className="mt-1"
                  />
                </div>
              </div>
            );
          })}
        </RadioGroup>
        
        <div className="text-xs text-gray-500">
          Seu plano {planName} tem acesso a: {availableQualities.map(q => 
            QUALITY_OPTIONS.find(opt => opt.value === q)?.label
          ).join(', ')}
        </div>
      </div>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Upgrade Necessário
            </DialogTitle>
            <DialogDescription>
              Para usar esta qualidade de imagem, você precisa fazer upgrade do seu plano.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Qualidade selecionada:</h4>
              {QUALITY_OPTIONS.map(option => {
                if (option.value === selectedUnavailableQuality) {
                  return (
                    <div key={option.value} className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      <span className="font-medium">{option.label}</span>
                      <CreditCostDisplay action={option.value} cost={option.cost} />
                    </div>
                  );
                }
                return null;
              })}
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Seu plano atual: {planName}</h4>
              <p className="text-sm text-gray-600">
                Qualidades disponíveis: {availableQualities.map(q => 
                  QUALITY_OPTIONS.find(opt => opt.value === q)?.label
                ).join(', ')}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h5 className="font-medium">Plano PRO</h5>
                  <p className="text-sm text-gray-600">Básica + Avançada</p>
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
                  <p className="text-sm text-gray-600">Todas as qualidades</p>
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
                  // Aqui você implementaria a lógica de upgrade
                  console.log('Redirect to upgrade page');
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

interface ImageQualityInfoProps {
  selectedQuality?: string;
  className?: string;
}

export function ImageQualityInfo({ selectedQuality, className = "" }: ImageQualityInfoProps) {
  const { planName } = useImageQualityOptions();
  
  if (!selectedQuality) return null;
  
  const option = QUALITY_OPTIONS.find(opt => opt.value === selectedQuality);
  
  if (!option) return null;

  return (
    <div className={`flex items-center gap-2 p-2 bg-blue-50 rounded-lg ${className}`}>
      <Image className="h-4 w-4 text-blue-600" />
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-800">
          Qualidade {option.label} selecionada
        </p>
        <CreditCostDisplay action={option.value} cost={option.cost} />
      </div>
    </div>
  );
}

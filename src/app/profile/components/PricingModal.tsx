"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Zap, Star, Crown } from "lucide-react";
import { toast } from "sonner";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: 'FREE' | 'PRO' | 'PREMIUM';
  userId: string;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: 'PRO' | 'PREMIUM';
  name: string;
  price: number;
  description: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonVariant: "default" | "outline";
  features: PlanFeature[];
  includes: PlanFeature[];
}

const PLANS: Record<'PRO' | 'PREMIUM', Plan> = {
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: 29.99,
    description: 'Nossas ferramentas mais avançadas de IA e personalização ao alcance das mãos',
    badge: 'Mais popular',
    badgeColor: 'bg-pink-500',
    icon: <Star className="h-5 w-5" />,
    buttonText: 'Atualize para o Pro',
    buttonVariant: 'default',
    features: [
      { text: 'Criação de IA ilimitada', included: true },
      { text: 'Geração de imagens com IA premium', included: true },
      { text: 'Operações avançadas de edição de IA', included: true },
      { text: 'Gere até 20 cartões', included: true },
    ],
    includes: [
      { text: '2.000 créditos de IA por mês', included: true },
      { text: 'Temas avançados e personalizados', included: true },
      { text: 'Suporte prioritário', included: true },
      { text: 'Exportação em alta qualidade', included: true },
      { text: 'Acesso antecipado a novos recursos', included: true },
    ]
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    price: 59.99,
    description: 'IA ilimitada e marca personalizada para elevar seu fluxo de trabalho',
    badge: 'Mais poderoso',
    badgeColor: 'bg-orange-500',
    icon: <Crown className="h-5 w-5" />,
    buttonText: 'Atualize para o Premium',
    buttonVariant: 'outline',
    features: [
      { text: 'Criação de IA ilimitada', included: true },
      { text: 'Geração de imagens com IA premium', included: true },
      { text: 'Operações avançadas de edição de IA', included: true },
      { text: 'Gere até 30 cartões', included: true },
    ],
    includes: [
      { text: 'Créditos de IA ilimitados', included: true },
      { text: 'Todos os temas + criação personalizada', included: true },
      { text: 'Suporte prioritário', included: true },
    ]
  }
};

export function PricingModal({ open, onOpenChange, currentPlan, userId }: PricingModalProps) {
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  // Determinar quais planos mostrar baseado no plano atual
  const getAvailablePlans = (): Plan[] => {
    switch (currentPlan) {
      case 'FREE':
        return [PLANS.PRO, PLANS.PREMIUM];
      case 'PRO':
        return [PLANS.PREMIUM];
      case 'PREMIUM':
        return []; // Nenhum upgrade disponível
      default:
        return [PLANS.PRO, PLANS.PREMIUM];
    }
  };

  const availablePlans = getAvailablePlans();

  const handleUpgrade = async (planId: 'PRO' | 'PREMIUM') => {
    setIsUpgrading(planId);
    
    try {
      // TODO: Implementar integração com gateway de pagamento
      toast.info("Redirecionando para pagamento...");
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Por enquanto, apenas mostrar sucesso
      toast.success(`Upgrade para ${planId} realizado com sucesso!`);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Erro no upgrade:', error);
      toast.error("Erro ao processar upgrade. Tente novamente.");
    } finally {
      setIsUpgrading(null);
    }
  };

  // Se não há planos disponíveis (usuário já tem PREMIUM)
  if (availablePlans.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              Você já tem o melhor plano!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Você está no plano Premium e tem acesso a todos os recursos da nossa plataforma.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl ${availablePlans.length === 1 ? 'max-w-lg' : ''}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Aumente seus créditos
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Escolha o plano ideal para suas necessidades
          </p>
        </DialogHeader>

        <div className={`grid gap-6 mt-6 ${availablePlans.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {availablePlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.id === 'PRO' ? 'border-blue-200 shadow-lg' : 'border-gray-200'}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className={`${plan.badgeColor} text-white px-3 py-1`}>
                    ⭐ {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {plan.icon}
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>

                <div className="mb-4">
                  <span className="text-4xl font-bold">R$ {plan.price}</span>
                  <span className="text-muted-foreground"> / por usuário / por mês</span>
                </div>
                <p className="text-sm text-muted-foreground">Cobrança mensal</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isUpgrading === plan.id}
                  className={`w-full ${plan.id === 'PRO' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={plan.buttonVariant}
                >
                  {isUpgrading === plan.id ? (
                    <>
                      <Zap className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>

                {/* Principais recursos */}
                <div>
                  <h4 className="font-semibold mb-3">Principais recursos</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Inclui tudo no Free, e... */}
                <div>
                  <h4 className="font-semibold mb-3">
                    Inclui tudo {plan.id === 'PRO' ? 'no Free' : 'no Pro'}, e...
                  </h4>
                  <ul className="space-y-2">
                    {plan.includes.map((include, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{include.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

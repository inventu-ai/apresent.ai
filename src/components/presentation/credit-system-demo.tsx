"use client";

import { useState } from "react";
import { CreditCounter, CreditCostDisplay, CreditWarning } from "@/components/ui/credit-counter";
import { CreditResetInfo, CreditResetCountdown } from "@/components/ui/credit-reset-info";
import { CardLimitSelector, CardLimitInfo } from "@/components/presentation/card-limit-selector";
import { ImageQualitySelector, ImageQualityInfo } from "@/components/presentation/image-quality-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useUserCredits } from "@/hooks/useUserCredits";
import { CREDIT_COSTS } from "@/lib/credit-system";
import { Zap, FileText, Image, Presentation } from "lucide-react";

export function CreditSystemDemo() {
  const [selectedCards, setSelectedCards] = useState<number>(5);
  const [selectedQuality, setSelectedQuality] = useState<string>("BASIC_IMAGE");
  const { remaining, nextReset, daysUntilReset, wasReset } = useUserCredits();

  // Calcular custos estimados
  const presentationCost = CREDIT_COSTS.PRESENTATION_CREATION; // Custo fixo de 40 créditos
  const imageCost = CREDIT_COSTS[selectedQuality as keyof typeof CREDIT_COSTS] || 0;
  const totalCost = presentationCost + imageCost;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Sistema de Créditos - Demo</h1>
        <p className="text-gray-600">
          Demonstração completa do sistema de limitações por planos com reset automático
        </p>
        {wasReset && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            ✨ Seus créditos foram resetados automaticamente!
          </div>
        )}
      </div>

      {/* Contador de Créditos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Seus Créditos
          </CardTitle>
          <CardDescription>
            Acompanhe seu uso de créditos em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreditCounter showDetails={true} />
        </CardContent>
      </Card>

      {/* Informações de Reset */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Reset Automático
          </CardTitle>
          <CardDescription>
            Seus créditos são renovados automaticamente a cada 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CreditResetCountdown 
            nextReset={nextReset}
            daysUntilReset={daysUntilReset}
          />
          <div className="text-sm text-gray-600">
            <p>• Reset automático baseado no banco de dados</p>
            <p>• Não depende de cron jobs externos</p>
            <p>• Acontece quando você usa o sistema após a data limite</p>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            Número de Cards
          </CardTitle>
          <CardDescription>
            Selecione quantos cards sua apresentação terá
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardLimitSelector 
            value={selectedCards}
            onValueChange={setSelectedCards}
          />
          <CardLimitInfo />
          <CreditCostDisplay 
            action="PRESENTATION_CREATION" 
            cost={presentationCost}
          />
        </CardContent>
      </Card>

      {/* Qualidade de Imagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Qualidade de Imagem
          </CardTitle>
          <CardDescription>
            Escolha a qualidade das imagens geradas por IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageQualitySelector 
            value={selectedQuality}
            onValueChange={setSelectedQuality}
          />
          <ImageQualityInfo 
            selectedQuality={selectedQuality}
            className="mt-4"
          />
        </CardContent>
      </Card>

      {/* Resumo de Custos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumo de Custos
          </CardTitle>
          <CardDescription>
            Estimativa de créditos para sua apresentação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Criar apresentação completa ({selectedCards} slides)</span>
              <Badge variant="outline">{presentationCost} créditos</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">1 imagem ({selectedQuality.replace('_', ' ').toLowerCase()})</span>
              <Badge variant="outline">{imageCost} créditos</Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between font-medium">
              <span>Total estimado</span>
              <Badge variant="default" className="bg-blue-600">
                {totalCost} créditos
              </Badge>
            </div>
          </div>

          {/* Aviso de créditos insuficientes */}
          <CreditWarning 
            remainingCredits={remaining}
            requiredCredits={totalCost}
          />

          {/* Botão de ação */}
          <div className="pt-4">
            <Button 
              className="w-full" 
              disabled={remaining < totalCost}
            >
              {remaining < totalCost ? (
                "Créditos Insuficientes"
              ) : (
                `Criar Apresentação (${totalCost} créditos)`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona o Sistema de Créditos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Plano FREE</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 500 créditos/mês</li>
                <li>• Até 10 cards</li>
                <li>• Imagem básica apenas</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Plano PRO</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 2000 créditos/mês</li>
                <li>• Até 20 cards</li>
                <li>• Imagem básica + avançada</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Plano PREMIUM</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Créditos ilimitados</li>
                <li>• Até 30 cards</li>
                <li>• Todas as qualidades</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Custos por Ação</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>Apresentação: 40 créditos</div>
              <div>Imagem básica: 5 créditos</div>
              <div>Imagem avançada: 10 créditos</div>
              <div>Imagem premium: 15 créditos</div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium mb-2">Sistema de Reset Automático</h4>
            <div className="text-sm space-y-1">
              <div>• Reset a cada 30 dias (relativo ao último reset)</div>
              <div>• Verificação automática ao usar o sistema</div>
              <div>• Histórico completo de todos os resets</div>
              <div>• Sem dependência de cron jobs externos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Detalhadas de Reset */}
      <CreditResetInfo showHistory={true} />
    </div>
  );
}

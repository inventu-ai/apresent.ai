"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Calendar, History, Info } from "lucide-react";
import { useUserCredits } from "@/hooks/useUserCredits";
import { CreditHistoryModal } from "./CreditHistoryModal";

interface CreditResetInfoProps {
  userId: string;
}

export function CreditResetInfo({ userId }: CreditResetInfoProps) {
  const { nextReset, daysUntilReset } = useUserCredits();
  const [showHistory, setShowHistory] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Reset de Créditos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Data não disponível";
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Reset de Créditos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-muted-foreground text-sm">
            Informações sobre o ciclo de renovação dos seus créditos
          </p>

          {/* Next Reset Card */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Próximo Reset
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {formatDate(nextReset)}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Info className="h-3 w-3 mr-1" />
                {daysUntilReset} dias
              </Badge>
            </div>
          </div>

          {/* Reset Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Ciclo de Reset
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A cada 30 dias
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Tipo de Reset
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automático
              </p>
            </div>
          </div>

          {/* History Button */}
          <Button
            variant="outline"
            onClick={() => setShowHistory(true)}
            className="w-full"
          >
            <History className="h-4 w-4 mr-2" />
            Ver Histórico
          </Button>

          {/* How it works */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Como funciona:
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Os créditos são resetados automaticamente a cada 30 dias
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                O reset acontece quando você usa o sistema após a data limite
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Créditos não utilizados não são acumulados
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                O histórico de todos os resets é mantido
              </li>
            </ul>
          </div>
        </div>

        {/* Credit History Modal */}
        <CreditHistoryModal
          open={showHistory}
          onOpenChange={setShowHistory}
          userId={userId}
        />
      </CardContent>
    </Card>
  );
}

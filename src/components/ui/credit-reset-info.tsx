"use client";

import { useState, useEffect } from "react";
import { useUserCredits } from "@/hooks/useUserCredits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, History, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CreditResetInfoProps {
  className?: string;
  showHistory?: boolean;
}

interface ResetHistoryItem {
  id: string;
  resetDate: string;
  previousCredits: number;
  newCredits: number;
  planName: string;
  resetReason: string;
}

export function CreditResetInfo({ className = "", showHistory = false }: CreditResetInfoProps) {
  const { nextReset, daysUntilReset, loading } = useUserCredits();
  const [history, setHistory] = useState<ResetHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(showHistory);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch('/api/user/credit-history?limit=5');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (showHistoryPanel) {
      fetchHistory();
    }
  }, [showHistoryPanel]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Reset de Créditos
        </CardTitle>
        <CardDescription>
          Informações sobre o ciclo de renovação dos seus créditos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Próximo Reset */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Próximo Reset</p>
              <p className="text-sm text-blue-700">
                {nextReset ? formatDate(nextReset) : 'Não definido'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="border-blue-500 text-blue-700">
              <Clock className="h-3 w-3 mr-1" />
              {daysUntilReset} {daysUntilReset === 1 ? 'dia' : 'dias'}
            </Badge>
          </div>
        </div>

        {/* Informações do Ciclo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 border rounded-lg">
            <p className="font-medium text-gray-700">Ciclo de Reset</p>
            <p className="text-gray-600">A cada 30 dias</p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="font-medium text-gray-700">Tipo de Reset</p>
            <p className="text-gray-600">Automático</p>
          </div>
        </div>

        {/* Botão para mostrar histórico */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            {showHistoryPanel ? 'Ocultar Histórico' : 'Ver Histórico'}
          </Button>
        </div>

        {/* Histórico de Resets */}
        {showHistoryPanel && (
          <div className="space-y-3">
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Histórico de Resets</h4>
              
              {historyLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          Reset - Plano {item.planName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDateTime(item.resetDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {item.previousCredits} → {item.newCredits}
                        </p>
                        <p className="text-xs text-gray-600">créditos</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum reset realizado ainda</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informação sobre o funcionamento */}
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-1">Como funciona:</p>
          <ul className="space-y-1 text-xs">
            <li>• Os créditos são resetados automaticamente a cada 30 dias</li>
            <li>• O reset acontece quando você usa o sistema após a data limite</li>
            <li>• Créditos não utilizados não são acumulados</li>
            <li>• O histórico de todos os resets é mantido</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

interface CreditResetCountdownProps {
  nextReset: Date | null;
  daysUntilReset: number;
  className?: string;
}

export function CreditResetCountdown({ nextReset, daysUntilReset, className = "" }: CreditResetCountdownProps) {
  if (!nextReset) return null;

  const isUrgent = daysUntilReset <= 3;
  const isSoon = daysUntilReset <= 7;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Clock className={`h-4 w-4 ${isUrgent ? 'text-red-500' : isSoon ? 'text-yellow-500' : 'text-gray-500'}`} />
      <span className={isUrgent ? 'text-red-600 font-medium' : isSoon ? 'text-yellow-600' : 'text-gray-600'}>
        Reset em {daysUntilReset} {daysUntilReset === 1 ? 'dia' : 'dias'}
      </span>
      {isUrgent && (
        <Badge variant="destructive" className="text-xs">
          Urgente
        </Badge>
      )}
    </div>
  );
}

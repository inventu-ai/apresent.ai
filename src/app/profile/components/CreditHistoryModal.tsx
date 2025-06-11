"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, RefreshCw, X } from "lucide-react";
import { getCreditResetHistoryAction } from "@/app/_actions/profile/creditActions";
import { useTranslation } from "@/contexts/LanguageContext";

interface CreditHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

interface CreditResetLog {
  id: string;
  resetDate: string;
  previousCredits: number;
  newCredits: number;
  planName: string;
  resetReason: string;
}

export function CreditHistoryModal({ open, onOpenChange, userId }: CreditHistoryModalProps) {
  const [history, setHistory] = useState<CreditResetLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useTranslation();

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open, userId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const result = await getCreditResetHistoryAction(20);
      if (result.success) {
        setHistory(result.history);
      }
    } catch (error) {
      console.error("Error loading credit history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getResetReasonText = (reason: string) => {
    switch (reason) {
      case 'monthly_cycle':
        return 'Ciclo mensal';
      case 'plan_upgrade':
        return 'Upgrade de plano';
      case 'manual_reset':
        return 'Reset manual';
      default:
        return 'Automático';
    }
  };

  const getPlanBadgeColor = (planName: string) => {
    switch (planName.toUpperCase()) {
      case 'FREE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'PRO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Histórico de Reset de Créditos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum reset encontrado</p>
              <p className="text-sm text-gray-400">
                O histórico aparecerá aqui após o primeiro reset de créditos
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {history.map((reset) => (
                  <div
                    key={reset.id}
                    className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDate(reset.resetDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPlanBadgeColor(reset.planName)}>
                          {reset.planName}
                        </Badge>
                        <Badge variant="outline">
                          {getResetReasonText(reset.resetReason)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        Créditos utilizados: {reset.previousCredits}
                      </div>
                      <div className="text-green-600 font-medium">
                        Resetado para: {reset.newCredits}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Sobre o histórico
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Mantemos o histórico completo de todos os resets</li>
              <li>• Os resets acontecem automaticamente a cada 30 dias</li>
              <li>• Upgrades de plano também geram um reset imediato</li>
            </ul>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

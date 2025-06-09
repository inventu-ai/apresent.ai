"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { DeleteAccountModal } from "./DeleteAccountModal";

interface DangerZoneProps {
  userId: string;
}

export function DangerZone({ userId }: DangerZoneProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Zona de Perigo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Ações irreversíveis relacionadas à sua conta
          </p>

          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">
                  Excluir conta
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  Esta ação não pode ser desfeita. Todos os seus dados, apresentações, 
                  imagens e configurações serão permanentemente removidos.
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                  <li>• Todas as apresentações serão excluídas</li>
                  <li>• Imagens geradas serão removidas</li>
                  <li>• Histórico de créditos será perdido</li>
                  <li>• Temas customizados serão deletados</li>
                  <li>• Esta ação é irreversível</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-700">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir minha conta
              </Button>
            </div>
          </div>

          {/* Additional warning */}
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Atenção:</strong> Considere fazer backup de suas apresentações importantes antes de excluir sua conta.
              </p>
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        <DeleteAccountModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          userId={userId}
        />
      </CardContent>
    </Card>
  );
}

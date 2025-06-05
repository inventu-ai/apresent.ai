"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { deleteUserAccount } from "@/app/_actions/profile/updateProfile";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function DeleteAccountModal({ open, onOpenChange, userId }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<"confirm" | "final">("confirm");

  const CONFIRM_TEXT = "EXCLUIR MINHA CONTA";

  const handleClose = () => {
    setConfirmText("");
    setStep("confirm");
    onOpenChange(false);
  };

  const handleFirstConfirm = () => {
    if (confirmText === CONFIRM_TEXT) {
      setStep("final");
    } else {
      toast.error("Texto de confirmação incorreto");
    }
  };

  const handleFinalDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUserAccount(userId);
      toast.success("Conta excluída com sucesso");
      
      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      toast.error("Erro ao excluir conta. Tente novamente.");
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {step === "confirm" ? "Confirmar Exclusão" : "Última Confirmação"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === "confirm" ? (
            <>
              {/* Warning */}
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                      Esta ação é irreversível!
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      Ao excluir sua conta, você perderá permanentemente:
                    </p>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <li>• Todas as suas apresentações</li>
                      <li>• Imagens geradas</li>
                      <li>• Temas customizados</li>
                      <li>• Histórico de créditos</li>
                      <li>• Configurações de conta</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="space-y-2">
                <Label htmlFor="confirm-text">
                  Para confirmar, digite: <strong>{CONFIRM_TEXT}</strong>
                </Label>
                <Input
                  id="confirm-text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Digite o texto de confirmação"
                  className="font-mono"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleFirstConfirm}
                  disabled={confirmText !== CONFIRM_TEXT}
                >
                  Continuar
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Final Warning */}
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                    Tem certeza absoluta?
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                    Esta é sua última chance de cancelar. Após clicar em "Excluir Definitivamente", 
                    sua conta e todos os dados serão removidos permanentemente.
                  </p>
                </div>
              </div>

              {/* Final Buttons */}
              <div className="flex justify-center space-x-3">
                <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleFinalDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Excluindo..." : "Excluir Definitivamente"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

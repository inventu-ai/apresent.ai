"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Globe, X } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";
import { updateUserProfile, updateNotificationSettings, deleteUserAccount } from "@/app/_actions/profile/updateProfile";
import { toast } from "sonner";
import { type Session } from "next-auth";
import { signOut } from "next-auth/react";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Session["user"];
}

export function ProfileModal({ open, onOpenChange, user }: ProfileModalProps) {
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    language: "pt-BR",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    integration: false,
    updates: false,
  });

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(" ") || [""];
      setFormData({
        name: nameParts[0] || "",
        surname: nameParts.slice(1).join(" ") || "",
        language: "pt-BR", // Default to Portuguese
      });

      // Initialize with default notification settings
      // In a real app, you'd fetch these from a separate notifications table
      setNotifications({
        integration: false,
        updates: false,
      });
    }
  }, [user]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update profile
      const fullName = `${formData.name} ${formData.surname}`.trim();
      await updateUserProfile(user.id, {
        name: fullName,
      });

      // Update notification settings
      await updateNotificationSettings(user.id, {
        emailIntegration: notifications.integration,
        emailUpdates: notifications.updates,
      });

      toast.success("Configurações salvas com sucesso!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsLoading(true);
    try {
      await deleteUserAccount(user.id);
      toast.success("Conta excluída com sucesso");
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      toast.error("Erro ao excluir conta");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#1e3a8a]">
              Configurações da conta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full p-0"
                  onClick={() => setShowAvatarUpload(true)}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{user.name || "Usuário"}</h3>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </div>

            {/* Name Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <Label htmlFor="surname">Sobrenome</Label>
                <Input
                  id="surname"
                  value={formData.surname}
                  onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                  placeholder="Seu sobrenome"
                />
              </div>

              {/* Language Selector */}
              <div>
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Idioma
                </Label>
                <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email and Notifications Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1e3a8a]">E-mails e notificações</h3>
              <p className="text-sm text-muted-foreground">
                Escolha quais e-mails você deseja receber de nós. Observe que você ainda receberá notificações importantes relacionadas à sua conta.
              </p>

              <div className="space-y-4">
                <p className="font-medium">Envie-me e-mails sobre</p>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="integration" className="text-sm">
                    Integração
                  </Label>
                  <Switch
                    id="integration"
                    checked={notifications.integration}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, integration: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="updates" className="text-sm">
                    Atualizações e anúncios de produtos
                  </Label>
                  <Switch
                    id="updates"
                    checked={notifications.updates}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, updates: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Delete Account */}
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {showDeleteConfirm ? "Confirmar exclusão" : "Excluir minha conta"}
              </Button>
              {showDeleteConfirm && (
                <p className="text-xs text-red-600 mt-1">
                  Clique novamente para confirmar a exclusão permanente da conta
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-[#1e3a8a] hover:bg-[#1e40af]"
              >
                {isLoading ? "Salvando..." : "Pronto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Upload Modal */}
      <AvatarUpload
        open={showAvatarUpload}
        onOpenChange={setShowAvatarUpload}
        currentImage={user.image}
        userId={user.id}
      />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Globe, Settings } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";
import { updateUserProfile, getUserProfile } from "@/app/_actions/profile/updateProfile";
import { toast } from "sonner";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useLanguage, useTranslation } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n/translations";

interface AccountSettingsProps {
  user: Session["user"];
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const { update } = useSession();
  const { language: currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    language: currentLanguage,
  });

  // Initialize form data when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // Try to get the user's language from the database
          const profileResult = await getUserProfile(user.id);
          const userLanguage = profileResult.user?.language || "pt-BR";
          
          setFormData({
            name: user.name || "",
            language: userLanguage as Language,
          });
        } catch (error) {
          // If there's an error, use default values
          console.error("Error loading user profile:", error);
          setFormData({
            name: user.name || "",
            language: currentLanguage, // Use current language context
          });
        }
      }
    };

    loadUserData();
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
      // Update profile with name and language
      await updateUserProfile(user.id, {
        name: formData.name.trim(),
        language: formData.language,
      });

      // Update the language context immediately
      setLanguage(formData.language as Language);

      // Update the NextAuth session with new data
      await update({
        user: {
          ...user,
          name: formData.name.trim(),
        }
      });

      toast.success(t.profile.settingsSaved);
      
      // O Next.js já recarrega a página automaticamente após a atualização do contexto
      // Não é necessário forçar um reload adicional
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(t.profile.settingsError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#3b82f6]">
          <Settings className="h-5 w-5" />
          {t.profile.accountSettings}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-muted-foreground">
            {t.profile.manageAccount}
          </p>

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
              <h3 className="font-semibold text-lg">{user.name || t.profile.name}</h3>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>

          {/* Name Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t.profile.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t.profile.fullName}
              />
            </div>

            {/* Language Selector */}
            <div>
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t.profile.language}
              </Label>
              <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value as Language }))}>
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


          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            >
              {isLoading ? t.common.loading : t.common.save}
            </Button>
          </div>
        </div>

        {/* Avatar Upload Modal */}
        <AvatarUpload
          open={showAvatarUpload}
          onOpenChange={setShowAvatarUpload}
          currentImage={user.image}
          userId={user.id}
        />
      </CardContent>
    </Card>
  );
}

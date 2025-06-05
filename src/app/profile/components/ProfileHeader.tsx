"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, User } from "lucide-react";
import { PlanBadge } from "@/components/ui/plan-badge";
import { usePlanBadge } from "@/hooks/usePlanBadge";
import { type Session } from "next-auth";

interface ProfileHeaderProps {
  user: Session["user"];
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const { planName, isLoading } = usePlanBadge();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-6">
          {/* Avatar with upload button */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Camera button overlay */}
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={() => setShowAvatarUpload(true)}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          {/* User info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-foreground">
                {user.name || "Usuário"}
              </h2>
              {!isLoading && (
                <PlanBadge 
                  plan={planName} 
                  size="md" 
                  variant="gradient"
                />
              )}
            </div>
            <p className="text-muted-foreground">{user.email}</p>
            
            {/* Role badge */}
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <User className="h-3 w-3 mr-1" />
                {user.role === "ADMIN" ? "Administrador" : "Usuário"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "./components/ProfileHeader";
import { AccountSettings } from "./components/AccountSettings";
import { CreditSection } from "./components/CreditSection";
import { CreditResetInfo } from "./components/CreditResetInfo";
import { DangerZone } from "./components/DangerZone";
import { useTranslation } from "@/contexts/LanguageContext";
import { useUserPlan } from "@/hooks/useUserPlan";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const { currentPlan, isLoading: planLoading, error: planError } = useUserPlan();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.profile.loading}</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/apresentai">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t.profile.backToSlides}
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.profile.title}</h1>
          <p className="text-muted-foreground">
            {t.profile.manageAccount}
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Header */}
          <ProfileHeader user={session.user} />

          {/* Account Settings */}
          <AccountSettings user={session.user} />

          {/* Credit Section */}
          {planLoading ? (
            <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
          ) : (
            <CreditSection userId={session.user.id} currentPlan={currentPlan} />
          )}

          {/* Credit Reset Info */}
          <CreditResetInfo userId={session.user.id} />

          {/* Danger Zone */}
          <DangerZone userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}

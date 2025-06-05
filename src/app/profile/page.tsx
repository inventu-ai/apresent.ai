import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "./components/ProfileHeader";
import { AccountSettings } from "./components/AccountSettings";
import { CreditSection } from "./components/CreditSection";
import { CreditResetInfo } from "./components/CreditResetInfo";
import { DangerZone } from "./components/DangerZone";
import { getUserCurrentPlan } from "@/lib/plan-checker";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Buscar plano atual do usuário
  let currentPlan: 'FREE' | 'PRO' | 'PREMIUM' = 'FREE';
  try {
    const plan = await getUserCurrentPlan(session.user.id);
    currentPlan = (plan?.name as 'FREE' | 'PRO' | 'PREMIUM') || 'FREE';
  } catch (error) {
    console.error('Erro ao buscar plano do usuário:', error);
    // Manter FREE como padrão em caso de erro
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
                Voltar para criar slides
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas configurações de conta e preferências
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Header */}
          <ProfileHeader user={session.user} />

          {/* Account Settings */}
          <AccountSettings user={session.user} />

          {/* Credit Section */}
          <CreditSection userId={session.user.id} currentPlan={currentPlan} />

          {/* Credit Reset Info */}
          <CreditResetInfo userId={session.user.id} />

          {/* Danger Zone */}
          <DangerZone userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}

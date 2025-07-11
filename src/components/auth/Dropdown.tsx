"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useState } from "react";
import { ThemeToggle } from "@/provider/theme-provider";
import { Skeleton } from "../ui/skeleton";
import { useUserCredits } from "@/hooks/useUserCredits";
import { Badge } from "../ui/badge";
import { PlanBadge } from "../ui/plan-badge";
import { usePlanBadge } from "@/hooks/usePlanBadge";
import { useTranslation } from "@/contexts/LanguageContext";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export function getInitials(name: string): string {
  // Split the name by spaces to get individual words
  const words = name.split(" ");
  // Map over the words array, extracting the first letter of each word and converting it to uppercase
  const initials = words.map((word) => word.charAt(0).toUpperCase());
  // Join the initials into a single string
  return initials.join("");
}

export function UserAvatar() {
  const session = useSession();
  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src={session.data?.user.image ?? ""} />
      <AvatarFallback>
        {getInitials(session.data?.user.name ?? "")}
      </AvatarFallback>
    </Avatar>
  );
}

export function UserDetail() {
  const session = useSession();
  const { remaining, isUnlimited, loading: creditsLoading, daysUntilReset } = useUserCredits();
  const { planName, isLoading: planLoading } = usePlanBadge();
  const { t } = useTranslation();

  return (
    <div className="max-w-max overflow-hidden">
      {session.status !== "loading" && (
        <div className="max-w-full text-ellipsis px-2 py-1.5">
          <p className="text-ellipsis text-start text-sm font-medium leading-none">
            {session?.data?.user?.name}
          </p>
          <p className="mt-1 text-ellipsis text-xs leading-none text-muted-foreground">
            {session?.data?.user?.email}
          </p>
          
          {/* Badge do Plano */}
          <div className="mt-2">
            {!planLoading && (
              <PlanBadge plan={planName} size="xs" />
            )}
          </div>
          
          {/* Informações de Créditos */}
          <div className="mt-2 flex items-center gap-2">
            {creditsLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : isUnlimited ? (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {t.userMenu.unlimited}
              </Badge>
            ) : (
              <div className="flex items-center gap-1">
                <Zap className={`h-3 w-3 ${planName === 'PREMIUM' ? 'text-yellow-500' : 'text-blue-600'}`} />
                <span className={`text-xs font-medium ${
                  planName === 'PREMIUM' ? 'text-yellow-600 font-semibold' : 'text-blue-600'
                }`}>
                  {remaining} {t.userMenu.credits}
                </span>
              </div>
            )}
          </div>
          
          {/* Reset info */}
          {!isUnlimited && !creditsLoading && daysUntilReset > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t.userMenu.resetIn} {daysUntilReset} {daysUntilReset === 1 ? t.userMenu.day : t.userMenu.days}
            </p>
          )}
        </div>
      )}
      {(session.status === "loading" ||
        session.status === "unauthenticated") && (
        <div className="grid gap-0.5 px-2 py-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-16 mt-2" />
        </div>
      )}
    </div>
  );
}

export default function SideBarDropdown({
  shouldViewFullName = false,
  side,
  align,
}: {
  shouldViewFullName?: boolean;
  side?: "top";
  align?: "start";
}) {
  const session = useSession();
  const userId = session.data?.user.id;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex max-w-full cursor-pointer items-center overflow-hidden rounded-md hover:bg-input">
          <UserAvatar />
          {shouldViewFullName && <UserDetail />}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align ?? "end"}
        side={side ?? "right"}
        sideOffset={5}
        alignOffset={5}
        className="w-60"
      >
        <UserDetail />
        <DropdownMenuSeparator />

        <DropdownMenuGroup className="flex flex-col gap-2 p-1">
          <DropdownMenuItem asChild>
            <ThemeToggle />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuGroup className="flex flex-col gap-2">
          <DropdownMenuItem asChild>
            <Button variant="outline" className="w-full">
              <Link
                href="/profile"
                className="flex h-full w-full items-center justify-center p-2"
              >
                <User className="mr-2 h-4 w-4" />
                <span>{t.userMenu.profile}</span>
              </Link>
            </Button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button
              variant={isLoggingOut ? "outlineLoading" : "outline"}
              className="w-full"
              disabled={isLoggingOut}
              onClick={async () => {
                setIsLoggingOut(true);
                document.cookie.split(";").forEach((cookie) => {
                  const [name] = cookie.split("=");
                  if (name) {
                    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                  }
                });
                await signOut({ callbackUrl: "/auth/signin" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t.userMenu.logOut}</span>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

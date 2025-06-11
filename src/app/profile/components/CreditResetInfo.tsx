"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Calendar, History, Info } from "lucide-react";
import { useUserCredits } from "@/hooks/useUserCredits";
import { CreditHistoryModal } from "./CreditHistoryModal";
import { useTranslation } from "@/contexts/LanguageContext";

interface CreditResetInfoProps {
  userId: string;
}

export function CreditResetInfo({ userId }: CreditResetInfoProps) {
  const { nextReset, daysUntilReset } = useUserCredits();
  const { t, language } = useTranslation();
  const [showHistory, setShowHistory] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {t.profile.creditReset}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return t.profile.dataNotAvailable;
    
    return new Intl.DateTimeFormat(language, {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          {t.profile.creditReset}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-muted-foreground text-sm">
            {t.profile.creditResetInfo}
          </p>

          {/* Next Reset Card */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {t.profile.nextReset}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {formatDate(nextReset)}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Info className="h-3 w-3 mr-1" />
                {daysUntilReset} {t.profile.days}
              </Badge>
            </div>
          </div>

          {/* Reset Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {t.profile.resetCycle}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.profile.every30Days}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {t.profile.resetType}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.profile.automatic}
              </p>
            </div>
          </div>

          {/* History Button */}
          <Button
            variant="outline"
            onClick={() => setShowHistory(true)}
            className="w-full"
          >
            <History className="h-4 w-4 mr-2" />
            {t.profile.viewHistory}
          </Button>

          {/* How it works */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              {t.profile.howItWorks}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {t.profile.creditsResetEvery30Days}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {t.profile.resetHappensAfterLimit}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {t.profile.unusedCreditsNotAccumulated}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {t.profile.resetHistoryMaintained}
              </li>
            </ul>
          </div>
        </div>

        {/* Credit History Modal */}
        <CreditHistoryModal
          open={showHistory}
          onOpenChange={setShowHistory}
          userId={userId}
        />
      </CardContent>
    </Card>
  );
}

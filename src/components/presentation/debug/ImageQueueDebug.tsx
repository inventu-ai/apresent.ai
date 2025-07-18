"use client";

import { useState, useEffect } from "react";
import { getImageQueueStats } from "@/lib/image-queue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ImageQueueDebug() {
  const [stats, setStats] = useState(getImageQueueStats());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getImageQueueStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Show debug panel only in development or when explicitly enabled
  useEffect(() => {
    const showDebug = process.env.NODE_ENV === 'development' || 
                     localStorage.getItem('showImageQueueDebug') === 'true';
    setIsVisible(showDebug);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Image Queue Debug
            <button
              onClick={() => {
                localStorage.setItem('showImageQueueDebug', 'false');
                setIsVisible(false);
              }}
              className="text-xs opacity-50 hover:opacity-100"
            >
              ✕
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {Object.entries(stats).map(([provider, stat]) => (
            <div key={provider} className="flex items-center justify-between p-2 rounded bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="font-medium capitalize">{provider}</span>
                <Badge 
                  variant={stat.isProcessing ? "default" : "secondary"}
                  className="text-xs"
                >
                  {stat.isProcessing ? "Processing" : "Idle"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Queue: {stat.queueLength}</span>
                <span>Delay: {stat.delay}ms</span>
                <span>Retries: {stat.maxRetries}</span>
              </div>
            </div>
          ))}
          
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>Updates every 1s</p>
            <p>To hide: localStorage.setItem('showImageQueueDebug', 'false')</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

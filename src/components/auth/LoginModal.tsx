"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaGoogle } from "react-icons/fa";
import { Sparkles, Zap, Shield, LogIn } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, prompt, onSuccess }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (provider: string) => {
    setIsLoading(true);
    
    try {
      const callbackUrl = encodeURIComponent(window.location.href);
      const result = await signIn(provider, {
        callbackUrl: `${window.location.href}?prompt=${encodeURIComponent(prompt)}`,
        redirect: true,
      });
      
      if (result?.ok) {
        onSuccess?.();
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    const callbackUrl = encodeURIComponent(window.location.href);
    window.location.href = `/auth/register?callbackUrl=${callbackUrl}&prompt=${encodeURIComponent(prompt)}`;
  };

  const handleExistingAccount = () => {
    const callbackUrl = encodeURIComponent(window.location.href);
    window.location.href = `/auth/signin?callbackUrl=${callbackUrl}&prompt=${encodeURIComponent(prompt)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Almost there! ✨</DialogTitle>
          <DialogDescription className="text-base">
            To generate your presentation about "{prompt}", you need to sign in quickly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits */}
          <div className="space-y-3 rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-3 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>AI slide creation in seconds</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>Your presentations saved securely</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Unlimited themes and customizations</span>
            </div>
          </div>

          {/* Sign in buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleSignIn("google")}
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              <FaGoogle size={16} />
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            <Button
              onClick={handleCreateAccount}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Create free account
            </Button>

            {/* Novo botão para usuários que já têm conta */}
            <Button
              onClick={handleExistingAccount}
              variant="ghost"
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
              size="lg"
            >
              <LogIn className="h-4 w-4" />
              Already have an account? Sign in
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <p className="text-xs text-muted-foreground text-center">
            100% free to start • No credit card required
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaGoogle } from "react-icons/fa";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "Login Necessário",
  description = "Para continuar criando sua apresentação, você precisa fazer login ou criar uma conta."
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn("google", { 
        redirect: false,
        callbackUrl: "/apresentai"
      });
      
      if (result?.ok) {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      setErrorMessage("Erro ao fazer login com Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Credenciais inválidas. Verifique seu email e senha.");
      } else if (result?.ok) {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      setErrorMessage("Ocorreu um erro ao tentar fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setErrorMessage("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="google" className="mt-4">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FaGoogle className="h-4 w-4" />
                  )}
                  Continuar com Google
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Não tem conta?{" "}
                    <Link
                      href="/auth/register"
                      className="font-medium text-primary hover:underline"
                      onClick={handleClose}
                    >
                      Criar conta
                    </Link>
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="mt-4">
              <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-email">Email</Label>
                  <Input 
                    id="modal-email" 
                    type="email" 
                    placeholder="exemplo@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-password">Senha</Label>
                  <Input 
                    id="modal-password" 
                    type="password" 
                    placeholder="******" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Mín. 6 caracteres
                    </p>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-xs text-primary hover:underline"
                      onClick={handleClose}
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                </div>
                
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Não tem conta?{" "}
                    <Link
                      href="/auth/register"
                      className="font-medium text-primary hover:underline"
                      onClick={handleClose}
                    >
                      Criar conta
                    </Link>
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
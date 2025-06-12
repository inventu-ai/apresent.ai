"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaGoogle } from "react-icons/fa";
import { Loader2, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AnimatedBackground } from "@/components/ui/animated-background";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const prompt = searchParams.get("prompt");
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (provider: string) => {
    const finalCallbackUrl = prompt 
      ? `${callbackUrl}?prompt=${encodeURIComponent(prompt)}`
      : callbackUrl;
    await signIn(provider, { callbackUrl: finalCallbackUrl });
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
        setErrorMessage("Invalid credentials. Please check your email and password.");
      } else {
        const finalCallbackUrl = prompt 
          ? `${callbackUrl}?prompt=${encodeURIComponent(prompt)}`
          : callbackUrl;
        window.location.href = finalCallbackUrl;
      }
    } catch (error) {
      setErrorMessage("An error occurred while trying to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedBackground showTitle={false}>
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50">
        <h1 className="text-3xl sm:text-4xl md:text-5xl text-white text-center font-serif italic">
          Login
        </h1>
      </div>
      
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-xl bg-white/95 backdrop-blur-sm border-white/20">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
            <CardDescription className="text-gray-600">Sign in to your account to continue</CardDescription>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Authentication error. Please try again.
                </AlertDescription>
              </Alert>
            )}
            
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="email" className="text-gray-700">Email</TabsTrigger>
                <TabsTrigger value="google" className="text-gray-700">Google</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="mt-4">
                <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="example@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="******" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white border-gray-300 text-gray-900"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Password must be at least 6 characters
                      </p>
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-xs text-blue-600 hover:text-blue-500"
                      >
                        Forgot password?
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
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="google" className="mt-4">
                <div className="flex flex-col space-y-4">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => handleSignIn("google")}
                  >
                    <FaGoogle className="h-4 w-4" />
                    Sign in with Google
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-gray-500 text-center">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                Privacy Policy
              </Link>.
            </p>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href={prompt 
                    ? `/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}&prompt=${encodeURIComponent(prompt)}`
                    : "/auth/register"
                  }
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Create account
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </AnimatedBackground>
  );
}

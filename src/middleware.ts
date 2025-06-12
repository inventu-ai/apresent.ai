import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth",
    "/terms",
    "/privacy",
  ];
  
     // Define protected routes that require authentication
   const protectedRoutes = [
     "/profile",
   ];
  
  const isAuthPage = pathname.startsWith("/auth");
  const isPublicRoute = publicRoutes.some(route => 
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If user is on auth page but already signed in, redirect to home page
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Only redirect to sign-in if accessing a protected route without session
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(request.url)}`,
        request.url
      )
    );
  }

  return NextResponse.next();
}

// Only run middleware on specific routes that need authentication checks
// This approach ensures .well-known, api, static files, etc. are never intercepted
export const config = {
  matcher: [
    "/profile/:path*",
    "/auth/:path*",
  ],
};

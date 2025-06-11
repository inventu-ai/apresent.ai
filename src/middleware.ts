import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isPublicPage = request.nextUrl.pathname.startsWith("/terms") || 
                      request.nextUrl.pathname.startsWith("/privacy") ||
                      request.nextUrl.pathname.startsWith("/auth/forgot-password") ||
                      request.nextUrl.pathname.startsWith("/auth/verify-code") ||
                      request.nextUrl.pathname.startsWith("/auth/reset-password");



  // If user is on auth page but already signed in, redirect to home page
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not authenticated and trying to access a protected route, redirect to sign-in
  if (!session && !isAuthPage && !isPublicPage && !request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(request.url)}`,
        request.url
      )
    );
  }

  return NextResponse.next();
}

// Add routes that should be protected by authentication
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

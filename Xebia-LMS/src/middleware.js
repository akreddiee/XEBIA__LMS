import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

    // Block non-admin users from accessing the admin space
    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      // Access granted only if JWT token exists
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/signin",
    },
    secret: process.env.NEXTAUTH_SECRET || "dev-secret",
  }
);

// Matches pages needing active login sessions
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/categories",
    "/categories/:path*",
    "/courses",
    "/courses/:path*",
    "/assessments",
    "/assessments/:path*",
    "/assessment/:path*",
    "/results",
    "/results/:path*",
    "/admin",
    "/admin/:path*",
    "/learn/:path*",
    "/notifications",
    "/notifications/:path*",
  ],
};

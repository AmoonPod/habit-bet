import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    // Create a response with the CORS headers
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const { supabase, response: supabaseResponse } = createClient(request);

    // Refresh session if possible
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // Handle authentication
    if (!session) {
      if (
        request.nextUrl.pathname !== "/login" &&
        request.nextUrl.pathname !== "/" &&
        !request.nextUrl.pathname.startsWith("/auth/")
      ) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } else {
      if (request.nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return supabaseResponse;
  } catch (e) {
    // If there's an error, proceed without blocking the request
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

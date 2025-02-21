import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "./utils/supabase/middleware";
export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) {
    if (
      request.nextUrl.pathname != "/login" &&
      request.nextUrl.pathname != "/"
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else {
    if (request.nextUrl.pathname == "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

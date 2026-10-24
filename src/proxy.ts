import { NextResponse, type NextRequest } from "next/server";

// Fast redirects for signed-out visitors. Cookies are only checked for
// presence here; signatures are verified again in pages and server actions
// (src/lib/adminAuth.ts and src/lib/userAuth.ts).
const ADMIN_COOKIE = "railbook_admin";
const USER_COOKIE = "railbook_session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || request.cookies.has(ADMIN_COOKIE)) {
      return NextResponse.next();
    }
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Everything else in the matcher needs a passenger login.
  if (!request.cookies.has(USER_COOKIE)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    // Booking needs an account; searching trains does not.
    "/booking/passenger-details/:path*",
    "/booking/trips",
    "/booking/tickets/:path*",
    "/dashboard",
    "/profile",
  ],
};

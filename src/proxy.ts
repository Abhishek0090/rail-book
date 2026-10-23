import { NextResponse, type NextRequest } from "next/server";

// Fast redirect for signed-out admins. The signature is verified again in the
// admin layout and in every admin server action (src/lib/adminAuth.ts).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has("railbook_admin")) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

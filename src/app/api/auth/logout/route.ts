import { clearUserSession } from "@/lib/userAuth";

// POST /api/auth/logout  Clears the session cookie.
export async function POST() {
  await clearUserSession();
  return Response.json({ ok: true });
}

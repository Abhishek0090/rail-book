import { getCurrentUser } from "@/lib/userAuth";

// GET /api/auth/me  The signed-in user, or 401.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  return Response.json({ user });
}

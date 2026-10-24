import { AuthError, authenticate } from "@/data/users";
import { createUserSession } from "@/lib/userAuth";

// POST /api/auth/login  { email, password }
// Sets the railbook_session cookie and returns the user (no password hash).
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  try {
    const user = authenticate(String(body.email ?? ""), String(body.password ?? ""));
    await createUserSession(user.id);
    return Response.json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }
}

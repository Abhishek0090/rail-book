import { AuthError, createUser } from "@/data/users";
import { createUserSession } from "@/lib/userAuth";

// POST /api/auth/register  { name, email, phone, age, gender, password }
// Creates the account, signs it in and returns the user.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  try {
    const user = createUser({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      phone: String(body.phone ?? ""),
      age: Number(body.age),
      gender: String(body.gender ?? ""),
      password: String(body.password ?? ""),
    });
    await createUserSession(user.id);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}

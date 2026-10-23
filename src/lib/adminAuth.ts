// Admin session: a signed, httpOnly cookie. Server-side only.
// Credentials are dummy defaults until the users table has admin roles;
// override them with ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_SESSION_SECRET.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "railbook_admin";
const SESSION_HOURS = 8;

const secret = () =>
  process.env.ADMIN_SESSION_SECRET ?? "railbook-dev-only-secret-change-me";

export const DEMO_ADMIN = {
  email: process.env.ADMIN_EMAIL ?? "admin@railbook.in",
  password: process.env.ADMIN_PASSWORD ?? "admin123",
};

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

export const checkCredentials = (email: string, password: string) =>
  safeEqual(email.trim().toLowerCase(), DEMO_ADMIN.email.toLowerCase()) &&
  safeEqual(password, DEMO_ADMIN.password);

export async function createAdminSession(email: string) {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = `${Buffer.from(email).toString("base64url")}.${expires}`;
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return null;

  const [emailPart, expires, signature] = value.split(".");
  if (!emailPart || !expires || !signature) return null;
  if (!safeEqual(signature, sign(`${emailPart}.${expires}`))) return null;
  if (Number(expires) < Date.now()) return null;

  return { email: Buffer.from(emailPart, "base64url").toString() };
}

// Call at the top of every admin page and server action.
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

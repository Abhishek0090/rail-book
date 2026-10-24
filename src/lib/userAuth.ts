// Passenger session: a signed, httpOnly cookie holding the user id. Server-side
// only. Separate from the admin session (src/lib/adminAuth.ts).
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/data/users";

export const USER_COOKIE = "railbook_session";
const SESSION_DAYS = 30;

const secret = () =>
  process.env.USER_SESSION_SECRET ?? "railbook-user-dev-only-secret-change-me";

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

export async function createUserSession(userId: number) {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expires}`;
  (await cookies()).set(USER_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearUserSession() {
  (await cookies()).delete(USER_COOKIE);
}

export async function getCurrentUser() {
  const value = (await cookies()).get(USER_COOKIE)?.value;
  if (!value) return null;
  const [id, expires, signature] = value.split(".");
  if (!id || !expires || !signature) return null;
  if (!safeEqual(signature, sign(`${id}.${expires}`))) return null;
  if (Number(expires) < Date.now()) return null;
  return getUser(Number(id));
}

// Only same-site paths are allowed as a post-login destination.
export const safeNext = (next: string | null | undefined, fallback = "/") =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : fallback;

// Call at the top of pages and actions that need a signed-in passenger.
export async function requireUser(next = "/") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeNext(next))}`);
  return user;
}

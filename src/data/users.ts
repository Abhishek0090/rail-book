// Dummy user store (server only). Replace with the users table later; keep
// the function names so the auth code and pages do not change.
import { hashPassword, verifyPassword } from "@/lib/password";
import { persist } from "./persist";
import type { Gender, PublicUser } from "./user";

type StoredUser = PublicUser & { passwordHash: string };

export class AuthError extends Error {}

export const DEMO_USER = {
  email: "abhishek.pal@example.com",
  password: "railbook123",
};

const USERS: StoredUser[] = persist("users", () => [
  {
    id: 1,
    name: "Abhishek Pal",
    email: DEMO_USER.email,
    phone: "+91 98765 43210",
    irctcId: "abhishek_pal",
    city: "Mumbai",
    memberSince: "March 2024",
    walletBalance: 1250,
    savedPassengers: [
      { name: "Abhishek Pal", age: 29, gender: "Male", berth: "Lower" },
      { name: "Diya Sharma", age: 27, gender: "Female", berth: "Upper" },
      { name: "Kavya Iyer", age: 58, gender: "Female", berth: "Lower" },
    ],
    passwordHash: hashPassword(DEMO_USER.password),
  },
]);

// Never hand the password hash to pages or API responses.
const toPublic = (stored: StoredUser): PublicUser => {
  const user: Partial<StoredUser> = { ...stored };
  delete user.passwordHash;
  return user as PublicUser;
};

export const getUser = (id: number) => {
  const user = USERS.find((u) => u.id === id);
  return user ? toPublic(user) : null;
};

export const countUsers = () => USERS.length;

export function authenticate(email: string, password: string) {
  const user = USERS.find((u) => u.email === email.trim().toLowerCase());
  // Hash anyway when the email is unknown so timing does not reveal accounts.
  const ok = verifyPassword(password, user?.passwordHash ?? USERS[0].passwordHash);
  if (!user || !ok) throw new AuthError("Wrong email or password");
  return toPublic(user);
}

export type NewUser = {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  password: string;
};

export function createUser(input: NewUser) {
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();

  if (name.length < 3 || name.length > 60) throw new AuthError("Enter your full name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError("Enter a valid email");
  if (!/^\+?[\d\s-]{10,15}$/.test(phone)) throw new AuthError("Enter a valid mobile number");
  if (!Number.isInteger(input.age) || input.age < 5 || input.age > 120) {
    throw new AuthError("Enter a valid age");
  }
  if (!["Male", "Female", "Transgender"].includes(input.gender)) {
    throw new AuthError("Pick a gender");
  }
  if (input.password.length < 8) throw new AuthError("Password must be at least 8 characters");
  if (USERS.some((u) => u.email === email)) {
    throw new AuthError("An account with this email already exists. Log in instead.");
  }

  const base = email.split("@")[0].replace(/[^a-z0-9_]/g, "_").slice(0, 20) || "user";
  const user: StoredUser = {
    id: Math.max(0, ...USERS.map((u) => u.id)) + 1,
    name,
    email,
    phone,
    irctcId: USERS.some((u) => u.irctcId === base) ? `${base}_${USERS.length + 1}` : base,
    city: "",
    memberSince: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    walletBalance: 0,
    savedPassengers: [
      { name, age: input.age, gender: input.gender as Gender, berth: "No Preference" },
    ],
    passwordHash: hashPassword(input.password),
  };
  USERS.push(user);
  return toPublic(user);
}

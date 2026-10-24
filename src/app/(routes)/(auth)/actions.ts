"use server";

import { redirect } from "next/navigation";
import { AuthError, authenticate, createUser } from "@/data/users";
import {
  clearUserSession,
  createUserSession,
  safeNext,
} from "@/lib/userAuth";

export type AuthResult = { ok: false; message: string } | null;

const text = (form: FormData, key: string) => String(form.get(key) ?? "");

export async function loginAction(
  _prev: AuthResult,
  form: FormData,
): Promise<AuthResult> {
  try {
    const user = authenticate(text(form, "email"), text(form, "password"));
    await createUserSession(user.id);
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, message: error.message };
    throw error;
  }
  redirect(safeNext(text(form, "next"), "/dashboard"));
}

export async function registerAction(
  _prev: AuthResult,
  form: FormData,
): Promise<AuthResult> {
  if (text(form, "password") !== text(form, "confirm")) {
    return { ok: false, message: "Passwords do not match" };
  }
  try {
    const user = createUser({
      name: text(form, "name"),
      email: text(form, "email"),
      phone: text(form, "phone"),
      age: Number(text(form, "age")),
      gender: text(form, "gender"),
      password: text(form, "password"),
    });
    await createUserSession(user.id);
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, message: error.message };
    throw error;
  }
  redirect(safeNext(text(form, "next"), "/dashboard"));
}

export async function logoutAction() {
  await clearUserSession();
  redirect("/");
}

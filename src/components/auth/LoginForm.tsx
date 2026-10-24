"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/(routes)/(auth)/actions";
import AuthField, { authInput } from "./AuthField";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <AuthField label="Email">
        <input name="email" type="email" required autoComplete="email" className={authInput} />
      </AuthField>
      <AuthField label="Password">
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={authInput}
        />
      </AuthField>

      {state && !state.ok && (
        <p role="alert" className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <button
        disabled={pending}
        className="w-full rounded-lg bg-brand-gradient py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Logging in..." : "Log in"}
      </button>

      <p className="text-center text-sm text-gray-600">
        New to RailBook?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          className="font-medium text-brand-700 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

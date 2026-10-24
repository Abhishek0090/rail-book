"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/(routes)/(auth)/actions";
import AuthField, { authInput } from "./AuthField";

export default function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(registerAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <AuthField label="Full name (as per Govt. ID)">
        <input name="name" required minLength={3} maxLength={60} autoComplete="name" className={authInput} />
      </AuthField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField label="Email">
          <input name="email" type="email" required autoComplete="email" className={authInput} />
        </AuthField>
        <AuthField label="Mobile number">
          <input name="phone" type="tel" required placeholder="+91 98765 43210" autoComplete="tel" className={authInput} />
        </AuthField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField label="Age">
          <input name="age" type="number" required min={5} max={120} className={authInput} />
        </AuthField>
        <AuthField label="Gender">
          <select name="gender" required defaultValue="Male" className={authInput}>
            <option>Male</option>
            <option>Female</option>
            <option>Transgender</option>
          </select>
        </AuthField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField label="Password">
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={authInput} />
        </AuthField>
        <AuthField label="Confirm password">
          <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={authInput} />
        </AuthField>
      </div>

      {state && !state.ok && (
        <p role="alert" className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <button
        disabled={pending}
        className="w-full rounded-lg bg-brand-gradient py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-medium text-brand-700 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}

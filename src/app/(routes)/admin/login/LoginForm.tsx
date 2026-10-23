"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className={inputClass}
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>

      {state && !state.ok && (
        <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <button
        disabled={pending}
        className="w-full rounded-lg bg-brand-gradient py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

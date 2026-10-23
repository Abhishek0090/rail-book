"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import type { ActionResult } from "@/app/(routes)/admin/actions";

export const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

// Clears the form after a successful save. Attach the ref to the <form>.
export function useResetOnSuccess(state: ActionResult) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return ref;
}

export function FormMessage({ state }: { state: ActionResult }) {
  if (!state) return null;
  return (
    <p
      className={`rounded-lg p-2 text-sm ${
        state.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      {state.message}
    </p>
  );
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      disabled={pending}
      className="rounded-lg bg-brand-gradient px-5 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
    >
      {pending ? "Saving..." : children}
    </button>
  );
}

// Delete button that confirms, runs a server action and shows the result.
export function DeleteButton({
  label,
  confirmText,
  action,
}: {
  label: string;
  confirmText: string;
  action: () => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={label}
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        startTransition(async () => {
          const result = await action();
          if (result?.ok) toast.success(result.message);
          else if (result) toast.error(result.message);
          router.refresh();
        });
      }}
      className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}

export function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {title && <h2 className="mb-4 font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

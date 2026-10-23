import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { DEMO_ADMIN, getAdminSession } from "@/lib/adminAuth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin login" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getAdminSession()) redirect("/admin");
  const { next } = await searchParams;
  const usingDefaults = !process.env.ADMIN_PASSWORD;

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-brand-gradient-soft px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white">
            <ShieldCheck size={24} />
          </span>
          <h1 className="mt-3 text-xl font-bold">RailBook Admin</h1>
          <p className="text-sm text-gray-500">
            Sign in to manage trains, stations and bookings
          </p>
        </div>

        <LoginForm next={next ?? "/admin"} />

        {usingDefaults && (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Demo login: <strong>{DEMO_ADMIN.email}</strong> /{" "}
            <strong>{DEMO_ADMIN.password}</strong>. Set ADMIN_EMAIL and
            ADMIN_PASSWORD in .env.local to change it.
          </p>
        )}
      </div>
    </div>
  );
}

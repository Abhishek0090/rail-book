import React from "react";
import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import { logoutAction } from "../actions";
import AdminNav from "./AdminNav";

export const metadata = { title: "Admin" };

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 md:flex-row">
        <aside className="md:w-56 md:shrink-0">
          <div className="mb-4 rounded-xl bg-brand-gradient p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">
              Admin
            </p>
            <p className="truncate text-sm font-medium">{session.email}</p>
          </div>
          <AdminNav />
          <form action={logoutAction} className="mt-4">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-rose-50 hover:text-rose-700">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { DEMO_USER } from "@/data/users";
import { getCurrentUser, safeNext } from "@/lib/userAuth";
import AuthCard from "../AuthCard";

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next, "/dashboard");
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthCard title="Log in to RailBook" subtitle="Log in to book tickets and see your trips">
      <LoginForm next={next} />
      <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        Demo account: <strong>{DEMO_USER.email}</strong> /{" "}
        <strong>{DEMO_USER.password}</strong>
      </p>
    </AuthCard>
  );
}

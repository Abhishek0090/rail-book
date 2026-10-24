import { redirect } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import { getCurrentUser, safeNext } from "@/lib/userAuth";
import AuthCard from "../AuthCard";

export const metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next, "/dashboard");
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthCard
      title="Create your RailBook account"
      subtitle="You are added as your first saved passenger"
      wide
    >
      <RegisterForm next={next} />
    </AuthCard>
  );
}

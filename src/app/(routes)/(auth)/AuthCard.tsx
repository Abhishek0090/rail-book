import { TrainFront } from "lucide-react";

export default function AuthCard({
  title,
  subtitle,
  children,
  wide = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-brand-gradient-soft px-4 py-12">
      <div
        className={`w-full ${wide ? "max-w-lg" : "max-w-sm"} rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8`}
      >
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white">
            <TrainFront size={24} />
          </span>
          <h1 className="mt-3 text-xl font-bold">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

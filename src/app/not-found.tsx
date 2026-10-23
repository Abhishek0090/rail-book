import Link from "next/link";
import { TrainTrack } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <TrainTrack className="text-brand-300" size={56} />
      <h1 className="mt-4 text-2xl font-bold">This page left the station</h1>
      <p className="mt-2 text-gray-500">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-brand-gradient px-6 py-2 text-white hover:brightness-110"
      >
        Back to home
      </Link>
    </div>
  );
}

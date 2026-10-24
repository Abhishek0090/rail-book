import { WifiOff } from "lucide-react";
import RetryButton from "./RetryButton";

export const metadata = { title: "Offline" };

// Cached by the service worker (public/sw.js) and shown when a page cannot
// load without a connection.
export default function OfflinePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <WifiOff size={32} />
      </span>
      <h1 className="mt-4 text-2xl font-bold">You are offline</h1>
      <p className="mt-2 max-w-sm text-gray-500">
        RailBook needs a connection to search trains and book tickets. Check
        your network and try again.
      </p>
      <RetryButton />
    </div>
  );
}

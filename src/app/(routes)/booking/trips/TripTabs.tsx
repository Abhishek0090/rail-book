"use client";

import { useState } from "react";
import Link from "next/link";

// Tabs over server-rendered booking lists.
export default function TripTabs({
  upcoming,
  past,
}: {
  upcoming: React.ReactNode[];
  past: React.ReactNode[];
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const items = tab === "upcoming" ? upcoming : past;

  return (
    <>
      <div className="flex justify-center gap-16 border-b bg-white text-sm font-medium">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 uppercase ${
              tab === t
                ? "border-b-2 border-brand-600 text-brand-700"
                : "text-gray-500"
            }`}
          >
            {t} ({t === "upcoming" ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {items.length > 0 ? (
          items
        ) : (
          <div className="py-16 text-center">
            <p className="mb-4 text-gray-600">
              {tab === "upcoming"
                ? "You do not have any upcoming trips"
                : "No past bookings found"}
            </p>
            <Link
              href="/"
              className="rounded-md bg-brand-gradient px-6 py-2 text-white hover:brightness-110"
            >
              BOOK TICKET NOW
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

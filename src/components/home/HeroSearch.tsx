"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeftRightIcon, Search } from "lucide-react";
import StationSearch from "@/components/common/StationSearch";
import TravelDatePicker from "@/components/common/TravelDatePicker";
import type { Station } from "@/constants/stations";

const QUOTAS = [
  { id: "GN", label: "General" },
  { id: "TQ", label: "Tatkal" },
  { id: "LD", label: "Ladies" },
  { id: "SS", label: "Senior Citizen" },
];

export default function HeroSearch({ stations }: { stations: Station[] }) {
  const router = useRouter();
  const find = (code: string) => stations.find((s) => s.code === code) ?? null;
  const [from, setFrom] = useState<Station | null>(find("MMCT"));
  const [to, setTo] = useState<Station | null>(find("NDLS"));
  const [date, setDate] = useState(() => new Date());
  const [quota, setQuota] = useState("GN");
  const [freeCancel, setFreeCancel] = useState(true);

  const search = () => {
    const params = new URLSearchParams({
      from: from!.code,
      to: to!.code,
      date: format(date, "yyyy-MM-dd"),
      quota,
    });
    router.push(`/booking/search?${params}`);
  };

  return (
    <div className="w-full max-w-5xl">
      {/* Quota tabs */}
      <div className="flex flex-wrap gap-2 px-1 pb-3">
        {QUOTAS.map((q) => (
          <button
            key={q.id}
            onClick={() => setQuota(q.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              quota === q.id
                ? "bg-brand-gradient text-white shadow"
                : "bg-white/80 text-gray-600 ring-1 ring-gray-200 hover:ring-brand-300"
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Search card. Phone: everything stacked, swap button floats on the
          right between From and To. Tablet (sm): From | To, then Date | Search.
          Desktop (lg): one row. */}
      <div className="flex w-full flex-col rounded-2xl border border-gray-200 bg-white shadow-xl shadow-brand-900/5 lg:flex-row lg:items-stretch">
        <div className="relative flex flex-col sm:flex-row lg:flex-[2]">
          <StationSearch label="From" stations={stations} value={from} onSelect={setFrom} />
          <div className="flex min-w-0 flex-1 border-t border-gray-200 sm:border-t-0 sm:border-l">
            <StationSearch label="To" stations={stations} value={to} onSelect={setTo} />
          </div>
          <button
            aria-label="Swap stations"
            className="absolute top-1/2 right-5 z-10 -translate-y-1/2 rotate-90 rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-grape-50 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 sm:rotate-0"
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
          >
            <ArrowLeftRightIcon className="h-4 w-4 text-grape-600" />
          </button>
        </div>

        <div className="flex flex-col border-t border-gray-200 sm:flex-row lg:flex-1 lg:border-t-0 lg:border-l">
          <TravelDatePicker value={date} onChange={setDate} />

          <button
            disabled={!from || !to || from.code === to.code}
            className="flex items-center justify-center gap-2 rounded-b-2xl bg-brand-gradient px-10 py-5 text-lg font-semibold text-white hover:brightness-110 disabled:bg-gray-300 disabled:bg-none sm:rounded-bl-none lg:rounded-tr-2xl"
            onClick={search}
          >
            <Search size={20} /> SEARCH
          </button>
        </div>
      </div>

      <label className="mt-3 flex items-center gap-2 px-1 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={freeCancel}
          onChange={(e) => setFreeCancel(e.target.checked)}
          className="accent-brand-600"
        />
        Free cancellation - get a full refund when you cancel
      </label>
    </div>
  );
}

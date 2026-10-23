"use client";

import { useEffect, useRef, useState } from "react";
import type { Station } from "@/constants/stations";

interface Props {
  label: string;
  stations: Station[];
  value?: Station | null;
  onSelect: (station: Station) => void;
}

const StationSearch = ({ label, stations, value, onSelect }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase()) ||
      s.city.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative min-w-0 flex-1" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer flex-col gap-1 px-6 py-5"
      >
        <span className="text-gray-400 text-sm">{label}</span>
        <strong className="truncate text-base">
          {value ? value.city : "Select Station"}
        </strong>
        <span className="truncate text-xs text-gray-500">
          {value ? `${value.code} - ${value.name}` : "Station or city"}
        </span>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 w-[min(340px,90vw)] rounded-xl border bg-white shadow-xl">
          <div className="p-3">
            <input
              autoFocus
              placeholder="Search for a station/city"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-500"
            />
          </div>

          <div className="max-h-72 overflow-y-auto">
            {filtered.map((s) => (
              <div
                key={s.code}
                onClick={() => {
                  onSelect(s);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-100"
              >
                <div className="h-10 w-12 shrink-0 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-semibold">
                  {s.code}
                </div>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-gray-500">
                    {s.city} - {s.state}
                  </p>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                No stations found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StationSearch;

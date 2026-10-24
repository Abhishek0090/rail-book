"use client";

import { useEffect, useRef, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { addDays, format } from "date-fns";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export default function TravelDatePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex flex-1 flex-col gap-1 px-6 py-5">
      <span className="text-sm text-gray-400">Departure Date</span>

      {/* Input */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-left font-semibold focus:outline-none"
      >
        {format(value, "EEE, dd MMM")}
      </button>

      <div className="mt-1 flex gap-2 text-xs">
        {[0, 1].map((offset) => {
          const date = addDays(new Date(), offset);
          const active =
            format(date, "yyyy-MM-dd") === format(value, "yyyy-MM-dd");
          return (
            <button
              key={offset}
              type="button"
              onClick={() => onChange(date)}
              className={`rounded-full border px-2 py-0.5 ${
                active
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-gray-200 text-gray-500 hover:border-brand-300"
              }`}
            >
              {offset === 0 ? "Today" : "Tomorrow"}
            </button>
          );
        })}
      </div>

      {/* Calendar Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 rounded-xl border bg-white p-3 shadow-xl">
          <Calendar
            onChange={(date) => {
              if (date instanceof Date) onChange(date);
              setOpen(false);
            }}
            value={value}
            className="rb-calendar"
            minDate={new Date()}
            maxDate={addDays(new Date(), 120)}
          />
        </div>
      )}
    </div>
  );
}

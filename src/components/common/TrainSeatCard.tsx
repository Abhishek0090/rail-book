"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  CLASS_NAMES,
  type SeatStatus,
  type TrainSearchResult,
} from "@/data/trains";

const STATUS_STYLES: Record<
  SeatStatus,
  { badge: string; text: string; label: string }
> = {
  AVL: {
    badge: "bg-emerald-600",
    text: "text-emerald-700",
    label: "Available",
  },
  RAC: { badge: "bg-amber-500", text: "text-amber-700", label: "RAC" },
  WL: { badge: "bg-rose-500", text: "text-rose-700", label: "Waitlist" },
};

const statusText = (status: SeatStatus, count: number) =>
  status === "AVL" ? `AVL ${count}` : `${status} ${count}`;

export default function TrainSeatCard({
  trainNo,
  trainName,
  rating,
  fromTime,
  fromStation,
  duration,
  toTime,
  toStation,
  dayOffset,
  seats,
}: TrainSearchResult) {
  const [activeClass, setActiveClass] = useState<string | null>(null);

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            <span className="font-mono text-brand-700">{trainNo}</span>{" "}
            {trainName}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {fromTime} {fromStation}
            </span>
            <span className="text-gray-400">- {duration} -</span>
            <span className="font-semibold text-gray-900">
              {toTime} {toStation}
              {dayOffset > 0 && (
                <sup className="ml-1 text-xs text-brand-600">+{dayOffset}</sup>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-sm text-amber-700">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span className="font-medium">{rating}</span>
        </div>
      </div>

      {/* Seat Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {seats.map((seat) => {
          const style = STATUS_STYLES[seat.status];
          return (
            <button
              key={seat.className}
              onClick={() =>
                setActiveClass(
                  activeClass === seat.className ? null : seat.className,
                )
              }
              className={`rounded-xl border p-4 text-left transition ${
                activeClass === seat.className
                  ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                  : "border-gray-200 bg-white hover:border-brand-300"
              }`}
            >
              <div className="text-sm font-medium">
                {seat.className}{" "}
                <span className="text-xs font-normal text-gray-500">
                  {CLASS_NAMES[seat.className]}
                </span>
              </div>
              <div className="mt-1 text-lg font-semibold">Rs {seat.price}</div>

              <div className="mt-2 flex items-center gap-2 text-sm">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs text-white ${style.badge}`}
                >
                  {statusText(seat.status, seat.count)}
                </span>
                <span className={`text-xs font-medium ${style.text}`}>
                  {style.label}
                </span>
              </div>

              {seat.status !== "AVL" && (
                <div className="mt-2 text-xs text-brand-700">
                  Confirm or 3X Refund*
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Availability Table */}
      {seats.map(
        (seat) =>
          activeClass === seat.className && (
            <div key={seat.className} className="mt-6 border-t pt-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                {seat.className} - Availability
              </h3>

              {seat.availability.map((a) => {
                const style = STATUS_STYLES[a.status];
                const params = new URLSearchParams({
                  train: trainNo,
                  cls: seat.className,
                  date: a.iso,
                  from: fromStation,
                  to: toStation,
                });
                return (
                  <div
                    key={a.iso}
                    className="flex items-center justify-between border-b py-3 last:border-none"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {a.date} <span className="text-gray-500">{a.day}</span>
                      </p>
                      <p className={`text-sm ${style.text}`}>
                        {statusText(a.status, a.count)}{" "}
                        <span className="ml-1">{style.label}</span>
                      </p>
                    </div>

                    <Link
                      href={`/booking/passenger-details?${params}`}
                      className="rounded-lg bg-brand-gradient px-4 py-1.5 text-sm font-medium text-white hover:brightness-110"
                    >
                      Book Rs {a.price}
                    </Link>
                  </div>
                );
              })}
            </div>
          ),
      )}
    </div>
  );
}

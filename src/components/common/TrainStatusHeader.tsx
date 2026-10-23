"use client";

import { useState } from "react";
import Link from "next/link";
import { addDays, format } from "date-fns";
import { Check } from "lucide-react";
import { getStation } from "@/constants/stations";
import type { Train } from "@/data/trains";

const TrainStatusHeader = ({ train }: { train: Train }) => {
  const [station, setStation] = useState(train.route[0].code);
  const [date, setDate] = useState(0);
  const last = train.route[train.route.length - 1].code;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">
          <span className="font-mono text-brand-700">{train.number}</span>{" "}
          {train.name}
        </h2>
        <p className="text-sm text-gray-500">
          {getStation(train.route[0].code)?.name} to {getStation(last)?.name} -
          Runs {train.runningDays.length === 7 ? "daily" : train.runningDays.join(" ")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500">
            Select Journey Station
          </label>
          <select
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={station}
            onChange={(e) => setStation(e.target.value)}
          >
            {train.route.map((s) => (
              <option key={s.code} value={s.code}>
                {getStation(s.code)?.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-500">Select Journey Date</label>
          <select
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={date}
            onChange={(e) => setDate(Number(e.target.value))}
          >
            {[0, -1, -2].map((offset) => (
              <option key={offset} value={offset}>
                {offset === 0 ? "Today" : offset === -1 ? "Yesterday" : "2 days ago"}{" "}
                {format(addDays(new Date(), offset), "dd MMM yyyy")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex overflow-hidden rounded-lg border border-brand-100">
        <div className="flex-1 bg-brand-50 flex flex-wrap items-center justify-center gap-6 py-3 text-sm">
          <span className="flex items-center gap-1 text-brand-700">
            <Check size={14} /> Free Cancellation
          </span>
          <span className="flex items-center gap-1 text-brand-700">
            <Check size={14} /> Instant Refund
          </span>
        </div>
        <Link
          href={`/booking/search?from=${station === last ? train.route[0].code : station}&to=${last}`}
          className="flex items-center bg-brand-gradient text-white px-6 font-medium hover:brightness-110"
        >
          Book Tickets
        </Link>
      </div>
    </div>
  );
};

export default TrainStatusHeader;

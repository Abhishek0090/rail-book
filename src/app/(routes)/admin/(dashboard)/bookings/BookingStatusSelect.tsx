"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import type { BookingStatus } from "@/data/bookings";
import { setBookingStatusAction } from "../../actions";

const STATUSES: BookingStatus[] = ["CONFIRMED", "RAC", "WAITLIST", "CANCELLED"];

export default function BookingStatusSelect({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      aria-label="Booking status"
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          const result = await setBookingStatusAction(bookingId, next);
          if (result?.ok) toast.success(result.message);
          else if (result) toast.error(result.message);
          router.refresh();
        });
      }}
      className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs"
    >
      {STATUSES.map((s) => (
        <option key={s}>{s}</option>
      ))}
    </select>
  );
}

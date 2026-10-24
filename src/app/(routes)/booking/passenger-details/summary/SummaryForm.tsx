"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { AGENT_FEE, CONVENIENCE_FEE } from "@/data/bookings";
import type { SeatStatus } from "@/data/trains";
import type { Trip } from "../PassengerForm";
import { createBookingAction } from "../../actions";
import type { DraftPassenger } from "../../passengers";

const paymentOptions = (walletBalance: number) => [
  { id: "upi", title: "UPI", subtitle: "Zero payment gateway charges" },
  { id: "card", title: "Credit / Debit / ATM Card", gateway: 0.018 },
  { id: "netbanking", title: "Net Banking", gateway: 0.012 },
  {
    id: "wallet",
    title: "RailBook Wallet",
    subtitle: `Balance Rs ${walletBalance}`,
  },
];

export default function SummaryForm({
  trip,
  farePerPassenger,
  seat,
  passengers,
  walletBalance,
}: {
  trip: Trip;
  farePerPassenger: number;
  seat: { status: SeatStatus; count: number };
  passengers: DraftPassenger[];
  walletBalance: number;
}) {
  const PAYMENT_OPTIONS = paymentOptions(walletBalance);
  const router = useRouter();
  const [paying, startPaying] = useTransition();
  const [showFare, setShowFare] = useState(true);
  const [payment, setPayment] = useState("upi");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const pax = passengers.length;
  const journeyDate = parseISO(trip.date);
  const ticketFare = farePerPassenger * pax;
  const option = PAYMENT_OPTIONS.find((o) => o.id === payment)!;
  const gatewayFee = Math.round(ticketFare * (option.gateway ?? 0) * 100) / 100;
  const total = Math.round(
    ticketFare + CONVENIENCE_FEE + AGENT_FEE + gatewayFee - discount,
  );

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "RAIL50") {
      setDiscount(50);
      toast.success("Coupon applied: Rs 50 off");
    } else {
      setDiscount(0);
      toast.error("Invalid coupon. Try RAIL50");
    }
  };

  const pay = () =>
    startPaying(async () => {
      // Demo payment. Replace with the gateway, then POST /api/booking/create.
      const result = await createBookingAction({
        trainNo: trip.trainNo,
        classCode: trip.classCode,
        from: trip.fromCode,
        to: trip.toCode,
        date: trip.date,
        passengers,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`Payment successful (demo). PNR ${result.pnr}`);
      router.push(`/booking/tickets/${result.pnr}`);
    });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      {/* Trip + fare left, payment right on large screens */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        {/* Header */}
        <div className="text-center border-b pb-3">
          <h1 className="font-semibold">Ticket Summary</h1>
          <p className="text-xs text-gray-500">
            Journey Date: {format(journeyDate, "EEE, dd MMM")}
          </p>
        </div>

        {/* Availability Info */}
        <div
          className={`text-center text-xs p-2 rounded ${
            seat.status === "AVL"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {seat.status === "AVL"
            ? `AVL ${seat.count} - seats available`
            : `${seat.status} ${seat.count} - seats filling fast. Book now for a chance to confirm.`}
        </div>

        {/* Train Info */}
        <div className="space-y-1 text-sm">
          <p className="font-medium">
            {trip.trainNo} - {trip.trainName.toUpperCase()}
          </p>
          <p className="text-gray-600">
            {trip.fromCode} - {trip.toCode}, {trip.classCode} ({trip.className}
            ), General, {pax} Passenger{pax > 1 ? "s" : ""}
          </p>
          <p className="text-gray-600">
            Boarding Point: {trip.fromCode}, {trip.departTime} |{" "}
            {format(journeyDate, "EEE, dd MMM")}
          </p>
          <ul className="pt-1 text-xs text-gray-500">
            {passengers.map((p, i) => (
              <li key={i}>
                {i + 1}. {p.name}, {p.age}, {p.gender}
              </li>
            ))}
          </ul>
        </div>

        {/* Coupon */}
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg p-2 text-sm outline-none focus:border-brand-500"
            placeholder="Have a coupon code? Try RAIL50"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button
            onClick={applyCoupon}
            className="rounded-lg border border-brand-600 px-4 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            Apply
          </button>
        </div>

        {/* Pay Only */}
        <div className="bg-brand-50 rounded-lg p-3">
          <button
            onClick={() => setShowFare(!showFare)}
            className="w-full flex justify-between items-center font-medium"
          >
            <span>Pay Only</span>
            <span className="flex items-center gap-1">
              Rs {total}{" "}
              {showFare ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {showFare && (
            <div className="mt-3 space-y-2 text-sm">
              <FareRow label={`Ticket Fare (${pax} x)`} value={ticketFare} />
              <FareRow label="Travel Insurance Premium" value={0} />
              <FareRow
                label="Convenience Fee (Incl. of GST)"
                value={CONVENIENCE_FEE}
              />
              <FareRow label="Agent Service charges" value={AGENT_FEE} />
              <FareRow label="Payment Gateway Charges" value={gatewayFee} />
              {discount > 0 && (
                <FareRow label="Coupon discount" value={-discount} />
              )}

              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Grand Total (Incl. of GST)</span>
                <span>Rs {total}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      <aside className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
        {/* Payment Options */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-medium">Payment Options</h2>
            <span className="flex items-center gap-1 text-xs text-brand-600">
              <Lock size={12} /> Safe & Secure
            </span>
          </div>

          {PAYMENT_OPTIONS.map((o) => (
            <label
              key={o.id}
              className={`border rounded-lg p-3 flex justify-between items-center cursor-pointer ${
                payment === o.id ? "border-brand-600 bg-brand-50" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium">{o.title}</p>
                <p className="text-xs text-gray-500">
                  {o.subtitle ??
                    `Gateway charges ${((o.gateway ?? 0) * 100).toFixed(1)}%`}
                </p>
              </div>
              <input
                type="radio"
                name="payment"
                className="accent-brand-600"
                checked={payment === o.id}
                onChange={() => setPayment(o.id)}
              />
            </label>
          ))}
        </div>

        <button
          onClick={pay}
          disabled={paying}
          className="w-full rounded-xl bg-brand-gradient py-3 font-medium text-white hover:brightness-110 disabled:opacity-60"
        >
          {paying ? "Processing payment..." : `Pay Rs ${total}`}
        </button>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-2">
          <p className="font-medium">100% Safe Payment Process</p>
          <p>Visa - Mastercard - RuPay - UPI</p>
        </div>
      </aside>
      </div>
    </div>
  );
}

function FareRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-gray-700">
      <span>{label}</span>
      <span>Rs {value.toFixed(2)}</span>
    </div>
  );
}

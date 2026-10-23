"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Fare = {
  ticketFare: number;
  convenienceFee: number;
  agentFee: number;
  gatewayFee: number;
  total: number;
};

export default function FareDetails({ fare }: { fare: Fare }) {
  const [showFare, setShowFare] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowFare(!showFare)}
        className="w-full flex justify-between items-center border rounded-lg p-3 font-medium"
      >
        <span>Fare Details</span>
        <span className="flex items-center gap-1">
          Rs {fare.total}{" "}
          {showFare ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {showFare && (
        <div className="border rounded-lg p-3 space-y-2 text-sm">
          <FareRow label="Ticket Fare" value={fare.ticketFare} />
          <FareRow
            label="Convenience Fee (Incl. of GST)"
            value={fare.convenienceFee}
          />
          <FareRow label="Agent Service Charge" value={fare.agentFee} />
          <FareRow label="Payment Gateway Charge" value={fare.gatewayFee} />

          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Grand Total (Incl. of GST)</span>
            <span>Rs {fare.total}</span>
          </div>
        </div>
      )}
    </>
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

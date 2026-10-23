"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import CommonSearch from "@/components/common/CommonSearch";

export default function PnrSearch({ samples }: { samples: string[] }) {
  const router = useRouter();
  const [pnr, setPnr] = useState("");

  const submit = () => {
    if (!/^\d{10}$/.test(pnr)) {
      toast.error("Enter a valid 10 digit PNR number");
      return;
    }
    router.push(`/pnr/${pnr}`);
  };

  return (
    <CommonSearch
      heading="PNR Status"
      placeholder="Enter 10 digit PNR Number"
      buttonText="Check PNR Status"
      value={pnr}
      onChange={(value) => setPnr(value.replace(/\D/g, "").slice(0, 10))}
      onSubmit={submit}
      suggestions={samples.map((s) => ({ label: s, value: s }))}
      onSuggestion={(value) => router.push(`/pnr/${value}`)}
    />
  );
}

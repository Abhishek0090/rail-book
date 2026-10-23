"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import CommonSearch from "./CommonSearch";

export type TrainOption = { number: string; name: string };

// Train number/name search used by the live status and schedule pages.
// Navigates to `${basePath}/${trainNumber}`. The server page passes `trains`.
const TrainNumberSearch = ({
  heading,
  buttonText,
  basePath,
  trains,
}: {
  heading: string;
  buttonText: string;
  basePath: string;
  trains: TrainOption[];
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = () => {
    const q = query.trim().toLowerCase();
    const match = q
      ? trains.find(
          (t) => t.number.includes(q) || t.name.toLowerCase().includes(q),
        )
      : undefined;
    if (!match) {
      toast.error("No train found. Try 12951 or Rajdhani.");
      return;
    }
    router.push(`${basePath}/${match.number}`);
  };

  return (
    <CommonSearch
      heading={heading}
      placeholder="Enter train number or name"
      buttonText={buttonText}
      value={query}
      onChange={setQuery}
      onSubmit={submit}
      suggestions={trains.slice(0, 4).map((t) => ({
        label: `${t.number} ${t.name}`,
        value: t.number,
      }))}
      onSuggestion={(number) => router.push(`${basePath}/${number}`)}
    />
  );
};

export default TrainNumberSearch;

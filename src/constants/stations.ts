import { persist } from "@/data/persist";

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
}

// Mutable list: the admin dashboard adds and removes stations.
export const STATIONS: Station[] = persist("stations", () => [
  { code: "NDLS", name: "New Delhi", city: "New Delhi", state: "Delhi" },
  {
    code: "MMCT",
    name: "Mumbai Central",
    city: "Mumbai",
    state: "Maharashtra",
  },
  {
    code: "CSMT",
    name: "Chhatrapati Shivaji Maharaj Terminus",
    city: "Mumbai",
    state: "Maharashtra",
  },
  {
    code: "LTT",
    name: "Lokmanya Tilak Terminus",
    city: "Mumbai",
    state: "Maharashtra",
  },
  { code: "KYN", name: "Kalyan Jn", city: "Kalyan", state: "Maharashtra" },
  { code: "NK", name: "Nashik Road", city: "Nashik", state: "Maharashtra" },
  { code: "BSL", name: "Bhusaval Jn", city: "Bhusaval", state: "Maharashtra" },
  {
    code: "JBP",
    name: "Jabalpur",
    city: "Jabalpur",
    state: "Madhya Pradesh",
  },
  {
    code: "PRYJ",
    name: "Prayagraj Jn",
    city: "Prayagraj",
    state: "Uttar Pradesh",
  },
  {
    code: "BSB",
    name: "Varanasi Jn",
    city: "Varanasi",
    state: "Uttar Pradesh",
  },
  { code: "CNB", name: "Kanpur Central", city: "Kanpur", state: "Uttar Pradesh" },
  { code: "HWH", name: "Howrah Jn", city: "Kolkata", state: "West Bengal" },
  { code: "KOTA", name: "Kota Jn", city: "Kota", state: "Rajasthan" },
  { code: "BRC", name: "Vadodara Jn", city: "Vadodara", state: "Gujarat" },
  { code: "ST", name: "Surat", city: "Surat", state: "Gujarat" },
  { code: "ADI", name: "Ahmedabad Jn", city: "Ahmedabad", state: "Gujarat" },
]);

export const getStation = (code: string | null | undefined) =>
  STATIONS.find((s) => s.code === code);

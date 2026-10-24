// Passenger-facing user types. Safe to import from client components:
// no password hashes or Node APIs here (those live in users.ts).
export type Gender = "Male" | "Female" | "Transgender";

export type SavedPassenger = {
  name: string;
  age: number;
  gender: Gender;
  berth: string;
};

// What pages and client components get for the signed-in user.
export type PublicUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  irctcId: string;
  city: string;
  memberSince: string;
  walletBalance: number;
  savedPassengers: SavedPassenger[];
};

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

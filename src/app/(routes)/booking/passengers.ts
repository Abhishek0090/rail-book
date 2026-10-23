// Passengers travel between booking steps in the URL as p=name|age|gender|berth.
import { CURRENT_USER } from "@/data/user";

export type DraftPassenger = {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Transgender";
  berth: string;
};

const GENDERS = ["Male", "Female", "Transgender"] as const;

export const encodePassenger = (p: {
  name: string;
  age: string | number;
  gender: string;
  berth: string;
}) => [p.name, p.age, p.gender, p.berth].join("|");

// Falls back to the user's saved passengers when the URL only has a count
// (bookings started from the chat assistant).
export function parsePassengers(
  raw: string | string[] | undefined,
  count: number,
): DraftPassenger[] {
  const list = (Array.isArray(raw) ? raw : raw ? [raw] : [])
    .map((entry) => {
      const [name, age, gender, berth] = entry.split("|");
      const ageNum = Number(age);
      if (!name?.trim() || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
        return null;
      }
      return {
        name: name.trim().slice(0, 60),
        age: ageNum,
        gender: GENDERS.find((g) => g === gender) ?? "Male",
        berth: berth || "No Preference",
      };
    })
    .filter((p): p is DraftPassenger => p !== null)
    .slice(0, 6);

  if (list.length) return list;

  return Array.from({ length: count }, (_, i): DraftPassenger => {
    const saved = CURRENT_USER.savedPassengers[i];
    return saved
      ? { ...saved }
      : { name: `Passenger ${i + 1}`, age: 30, gender: "Male", berth: "No Preference" };
  });
}

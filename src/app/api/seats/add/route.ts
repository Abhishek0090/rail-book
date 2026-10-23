import { addCoach } from "@/data/mutations";
import { getSeats } from "@/data/admin";
import { adminRoute } from "@/lib/adminApi";

// POST /api/seats/add  { trainNo, code, classCode, totalSeats }  (admin only)
// Seats belong to a coach, so this adds a coach and returns its seat layout.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return adminRoute(() => {
    const coach = addCoach(body);
    return { coach, seats: getSeats(coach) };
  });
}

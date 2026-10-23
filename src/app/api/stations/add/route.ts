import { addStation } from "@/data/mutations";
import { adminRoute } from "@/lib/adminApi";

// POST /api/stations/add  { code, name, city, state }  (admin only)
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return adminRoute(() => addStation(body));
}

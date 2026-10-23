import { addTrain } from "@/data/mutations";
import { adminRoute } from "@/lib/adminApi";

// POST /api/trains/add  (admin only). Body matches TrainInput in src/data/mutations.ts.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return adminRoute(() => addTrain(body));
}

import { getCoaches } from "@/data/admin";

// GET /api/coaches?train=12951
export async function GET(request: Request) {
  const train = new URL(request.url).searchParams.get("train") ?? undefined;
  return Response.json({ coaches: getCoaches(train) });
}

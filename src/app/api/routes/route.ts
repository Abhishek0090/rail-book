import { getTrain, TRAINS } from "@/data/trains";

// GET /api/routes?train=12951 -> that train's stops; no param -> all trains.
export async function GET(request: Request) {
  const number = new URL(request.url).searchParams.get("train");
  if (!number) return Response.json({ trains: TRAINS });

  const train = getTrain(number);
  if (!train) {
    return Response.json({ error: "Train not found" }, { status: 404 });
  }
  return Response.json({ train: train.number, route: train.route });
}

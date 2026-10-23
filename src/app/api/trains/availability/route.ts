import { isValid, parseISO } from "date-fns";
import { getSeatStatus, getTrain, type ClassCode } from "@/data/trains";

// GET /api/trains/availability?train=12951&date=2026-10-30
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const train = getTrain(searchParams.get("train"));
  if (!train) {
    return Response.json({ error: "Train not found" }, { status: 404 });
  }

  const parsed = parseISO(searchParams.get("date") ?? "");
  const date = isValid(parsed) ? parsed : new Date();
  const classes = train.classes.map((classCode: ClassCode) => ({
    classCode,
    ...getSeatStatus(train.number, classCode, date),
  }));

  return Response.json({ train: train.number, classes });
}

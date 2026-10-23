import { isValid, parseISO } from "date-fns";
import { searchTrains } from "@/data/trains";

// GET /api/trains/search?from=MMCT&to=NDLS&date=2026-10-30
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) {
    return Response.json(
      { error: "from and to station codes are required" },
      { status: 400 },
    );
  }

  const date = parseISO(searchParams.get("date") ?? "");
  return Response.json({
    trains: searchTrains(from, to, isValid(date) ? date : new Date()),
  });
}

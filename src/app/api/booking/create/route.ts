import { NextResponse } from "next/server";
import { withSeatLock, developmentSeatLocks } from "@/lib/bookingEngine";
import { generatePnr } from "@/lib/pnr";
import { getSeatLockProvider } from "@/lib/redisLock";
import { db } from "@/db";
import { bookings } from "@/db/schema/bookings";
import { transactions } from "@/db/schema/transactions";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/userAuth";

type CreateBookingBody = {
  trainId?: number;
  journeyDate?: string;
  classCode?: string;
  seatId?: number;
  paymentTransactionId?: string;
  sourceStationId?: number;
  destinationStationId?: number;
  coachId?: number;
  fare?: string;
};

// PostgreSQL booking flow with seat locking (chapter 12). The user always
// comes from the session cookie, never from the request body.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Log in to book" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not set; the app books through the in-memory store" },
      { status: 503 },
    );
  }
  const body = (await request.json().catch(() => ({}))) as CreateBookingBody;
  const required = [
    body.trainId,
    body.journeyDate,
    body.classCode,
    body.seatId,
    body.paymentTransactionId,
    body.sourceStationId,
    body.destinationStationId,
    body.coachId,
    body.fare,
  ];
  if (required.some((value) => value === undefined || value === "")) {
    return NextResponse.json(
      {
        error: "train, date, class, seat, and payment transaction are required",
      },
      { status: 400 },
    );
  }

  if (!body.paymentTransactionId?.trim()) {
    return NextResponse.json(
      { error: "Booking requires a verified payment transaction" },
      { status: 402 },
    );
  }

  const result = await withSeatLock(
    getSeatLockProvider(developmentSeatLocks),
    {
      trainId: body.trainId!,
      journeyDate: body.journeyDate!,
      classCode: body.classCode!,
      seatId: body.seatId!,
      paymentTransactionId: body.paymentTransactionId,
    },
    async () => {
      const existing = await db
        .select()
        .from(bookings)
        .where(eq(bookings.payment_transaction_id, body.paymentTransactionId!))
        .limit(1);
      if (existing[0]) return existing[0];

      return db.transaction(async (tx) => {
        const [booking] = await tx
          .insert(bookings)
          .values({
            user_id: user.id,
            train_id: body.trainId!,
            source_station_id: body.sourceStationId!,
            destination_station_id: body.destinationStationId!,
            coach_id: body.coachId!,
            seat_id: body.seatId!,
            status: "CONFIRMED",
            pnr: generatePnr(),
            journey_date: body.journeyDate!,
            fare: body.fare!,
            payment_transaction_id: body.paymentTransactionId!,
          })
          .returning();

        await tx.insert(transactions).values({
          booking_id: booking.id,
          amount: body.fare!,
          status: "success",
          provider: "tokenized-gateway",
        });

        return booking;
      });
    },
  );

  if (!result) {
    return NextResponse.json(
      {
        status: "RAC",
        message: "That seat is currently held; offer RAC or waitlist.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json(result, { status: 201 });
}

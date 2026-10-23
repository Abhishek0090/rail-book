"use server";

import { revalidatePath } from "next/cache";
import { createBooking, MutationError, type NewBooking } from "@/data/mutations";

export type CreateBookingResult =
  | { ok: true; pnr: string }
  | { ok: false; message: string };

// Demo checkout: stores the booking in memory and returns its PNR.
// With a database, call the same logic as POST /api/booking/create.
export async function createBookingAction(
  input: NewBooking,
): Promise<CreateBookingResult> {
  try {
    const booking = createBooking(input);
    revalidatePath("/", "layout");
    return { ok: true, pnr: booking.pnr };
  } catch (error) {
    if (error instanceof MutationError) return { ok: false, message: error.message };
    throw error;
  }
}

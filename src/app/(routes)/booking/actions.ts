"use server";

import { revalidatePath } from "next/cache";
import { createBooking, MutationError, type NewBooking } from "@/data/mutations";
import { getCurrentUser } from "@/lib/userAuth";

export type CreateBookingResult =
  | { ok: true; pnr: string }
  | { ok: false; message: string };

// Demo checkout for the signed-in passenger: stores the booking in memory
// and returns its PNR.
// With a database, call the same logic as POST /api/booking/create.
export async function createBookingAction(
  input: Omit<NewBooking, "userId">,
): Promise<CreateBookingResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in again to book" };
  try {
    const booking = createBooking({ ...input, userId: user.id });
    revalidatePath("/", "layout");
    return { ok: true, pnr: booking.pnr };
  } catch (error) {
    if (error instanceof MutationError) return { ok: false, message: error.message };
    throw error;
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkCredentials,
  clearAdminSession,
  createAdminSession,
  requireAdmin,
} from "@/lib/adminAuth";
import {
  addCoach,
  addStation,
  addTrain,
  deleteCoach,
  deleteStation,
  deleteTrain,
  MutationError,
  setBookingStatus,
  type TrainInput,
} from "@/data/mutations";
import type { ClassCode } from "@/data/trains";

export type ActionResult = { ok: boolean; message: string } | null;

const text = (form: FormData, key: string) => String(form.get(key) ?? "");

// Runs a mutation as a signed-in admin and refreshes every page that shows it.
async function run(work: () => string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const message = work();
    revalidatePath("/", "layout");
    return { ok: true, message };
  } catch (error) {
    if (error instanceof MutationError) return { ok: false, message: error.message };
    throw error;
  }
}

// ---------- session ----------

export async function loginAction(
  _prev: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const email = text(form, "email");
  if (!checkCredentials(email, text(form, "password"))) {
    return { ok: false, message: "Wrong email or password" };
  }
  await createAdminSession(email.trim().toLowerCase());
  const next = text(form, "next");
  // Only allow redirects inside the admin area.
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

// ---------- data ----------

export async function addStationAction(_prev: ActionResult, form: FormData) {
  return run(() => {
    const station = addStation({
      code: text(form, "code"),
      name: text(form, "name"),
      city: text(form, "city"),
      state: text(form, "state"),
    });
    return `Added station ${station.code} - ${station.name}`;
  });
}

export async function deleteStationAction(code: string) {
  return run(() => {
    deleteStation(code);
    return `Deleted station ${code}`;
  });
}

export async function addTrainAction(_prev: ActionResult, form: FormData) {
  return run(() => {
    let route: TrainInput["route"];
    try {
      route = JSON.parse(text(form, "route"));
    } catch {
      throw new MutationError("Route data is invalid");
    }
    const train = addTrain({
      number: text(form, "number"),
      name: text(form, "name"),
      type: text(form, "type"),
      runningDays: form.getAll("runningDays").map(String),
      pantry: form.get("pantry") === "on",
      classes: form.getAll("classes").map(String),
      route,
    });
    return `Added train ${train.number} ${train.name} with default coaches`;
  });
}

export async function deleteTrainAction(number: string) {
  return run(() => {
    deleteTrain(number);
    return `Deleted train ${number}`;
  });
}

export async function addCoachAction(_prev: ActionResult, form: FormData) {
  return run(() => {
    const coach = addCoach({
      trainNo: text(form, "trainNo"),
      code: text(form, "code"),
      classCode: text(form, "classCode") as ClassCode,
      totalSeats: Number(text(form, "totalSeats")),
    });
    return `Added coach ${coach.code} to ${coach.trainNo}`;
  });
}

export async function deleteCoachAction(trainNo: string, code: string) {
  return run(() => {
    deleteCoach(trainNo, code);
    return `Deleted coach ${code} from ${trainNo}`;
  });
}

export async function setBookingStatusAction(bookingId: string, status: string) {
  return run(() => {
    const booking = setBookingStatus(bookingId, status);
    return `PNR ${booking.pnr} is now ${booking.status}`;
  });
}

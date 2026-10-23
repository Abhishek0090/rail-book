import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),

  booking_id: integer("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),

  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),

  status: text("status").notNull(), // success, failed, pending

  provider: text("provider").notNull(), // razorpay, stripe, offline

  created_at: timestamp("created_at").defaultNow().notNull(),
});

import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  date,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { trains } from "./train";
import { stations } from "./stations";
import { coaches } from "./coaches";
import { seats } from "./seats";

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),

    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    train_id: integer("train_id")
      .notNull()
      .references(() => trains.id),

    source_station_id: integer("source_station_id")
      .notNull()
      .references(() => stations.id),

    destination_station_id: integer("destination_station_id")
      .notNull()
      .references(() => stations.id),

    coach_id: integer("coach_id")
      .notNull()
      .references(() => coaches.id),

    seat_id: integer("seat_id")
      .notNull()
      .references(() => seats.id),

    status: text("status").notNull(), // CONFIRMED, RAC, WL, CANCELLED

    payment_transaction_id: text("payment_transaction_id").notNull(),

    pnr: text("pnr").notNull().unique(),

    journey_date: date("journey_date").notNull(),

    fare: numeric("fare", { precision: 10, scale: 2 }).notNull(),

    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    paymentTransactionUnique: uniqueIndex(
      "bookings_payment_transaction_id_unique",
    ).on(table.payment_transaction_id),
  }),
);

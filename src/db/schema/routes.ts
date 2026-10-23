import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { trains } from "./train";
import { stations } from "./stations";

export const trainRoutes = pgTable("train_routes", {
  id: serial("id").primaryKey(),
  train_id: integer("train_id")
    .notNull()
    .references(() => trains.id, { onDelete: "cascade" }),
  station_id: integer("station_id")
    .notNull()
    .references(() => stations.id, { onDelete: "cascade" }),
  stop_number: integer("stop_number").notNull(), // sequence
  arrival_time: text("arrival_time"), // "04:10"
  departure_time: text("departure_time"),
  distance_from_start: integer("distance_from_start").notNull(), // km
  created_at: timestamp("created_at").defaultNow().notNull(),
});

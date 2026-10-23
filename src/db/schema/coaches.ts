import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { trains } from "./train";

export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  train_id: integer("train_id")
    .notNull()
    .references(() => trains.id, { onDelete: "cascade" }),
  coach_code: text("coach_code").notNull(), // B1, S2, A3, CC1
  coach_type: text("coach_type").notNull(), // SL, 3A, 2A, CC, EC
  total_seats: integer("total_seats").notNull(), // 72, 80, etc.
  created_at: timestamp("created_at").defaultNow().notNull(),
});

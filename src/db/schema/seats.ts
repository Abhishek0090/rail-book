import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { coaches } from "./coaches";

export const seats = pgTable("seats", {
  id: serial("id").primaryKey(),
  coach_id: integer("coach_id")
    .notNull()
    .references(() => coaches.id, { onDelete: "cascade" }),
  seat_number: integer("seat_number").notNull(), // 1 - 72
  berth_type: text("berth_type").notNull(), // LB, UB, SL, SU, MB, SIDE-L, SIDE-U
  position_meta: text("position_meta"), // JSON like: {"row":1,"column":2}
  created_at: timestamp("created_at").defaultNow().notNull(),
});

import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g. PRYJ
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

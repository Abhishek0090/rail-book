import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const trains = pgTable("trains", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(), // 11055
  name: text("name").notNull(),
  type: text("type").notNull(), // express, superfast, rajdhani...
  created_at: timestamp("created_at").defaultNow().notNull(),
});

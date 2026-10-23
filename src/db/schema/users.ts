import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: text("role").default("user").notNull(), // admin | user
  created_at: timestamp("created_at").defaultNow().notNull(),
});

import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Reads DATABASE_URL from .env.local (or the environment) - never hardcode it.
config({ path: ".env.local" });
config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local (see docs/12-building-apis.md).");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*.ts",
  out: "./src/drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

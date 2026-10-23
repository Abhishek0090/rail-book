import { defineConfig } from "drizzle-kit";
import "dotenv/config";

console.log(process.env.DATABASE_URL, "ENV");
export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/*.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "postgresql://postgres:abhishek@localhost:5432/postgres",
  },
});

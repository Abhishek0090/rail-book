import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// A pool connects lazily on the first query, so importing this module never
// crashes the dev server when PostgreSQL is not running yet.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error.message);
});

export const db = drizzle(pool);

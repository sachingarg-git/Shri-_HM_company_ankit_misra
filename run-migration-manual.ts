import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

const db = drizzle(pool);

async function runMigrations() {
  try {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully!");
    await pool.end();
  } catch (error) {
    console.error("Migration failed:", error);
    await pool.end();
    process.exit(1);
  }
}

runMigrations();

import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function dropConstraint() {
  const client = await pool.connect();
  try {
    console.log("Dropping foreign key constraint...");
    await client.query(
      'ALTER TABLE "credit_agreements" DROP CONSTRAINT IF EXISTS "credit_agreements_client_id_clients_id_fk"'
    );
    console.log("✓ Foreign key constraint dropped successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
    await pool.end();
  }
}

dropConstraint();

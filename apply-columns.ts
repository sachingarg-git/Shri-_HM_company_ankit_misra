import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function runSQL() {
  const client = await pool.connect();
  try {
    console.log("Connecting to database...");
    
    // Read and execute SQL
    const sql = fs.readFileSync("./add-credit-agreement-columns.sql", "utf-8");
    const statements = sql.split(";").filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Executing:", statement.trim().substring(0, 80) + "...");
        await client.query(statement.trim());
        console.log("✓ Success");
      }
    }
    
    console.log("\n✓ All columns added successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
    await pool.end();
  }
}

runSQL();

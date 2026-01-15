import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS "invoice_payments" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "invoice_id" varchar NOT NULL REFERENCES "sales_invoices"("id") ON DELETE cascade,
        "payment_amount" numeric(15, 2) NOT NULL,
        "payment_date" timestamp NOT NULL,
        "payment_mode" text DEFAULT 'CASH',
        "reference_number" text,
        "remarks" text,
        "created_by" varchar NOT NULL REFERENCES "users"("id"),
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `;
    await pool.query(sql);
    console.log('✅ invoice_payments table created successfully');
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createTable();

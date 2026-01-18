require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting purchase_invoice_payments table migration...');

    // Create purchase_invoice_payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchase_invoice_payments (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id VARCHAR(255) NOT NULL,
        payment_amount DECIMAL(15, 2) NOT NULL,
        payment_date TIMESTAMP NOT NULL,
        payment_mode TEXT DEFAULT 'CASH',
        reference_number TEXT,
        remarks TEXT,
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ purchase_invoice_payments table created successfully!');

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_purchase_invoice_payments_invoice_id 
      ON purchase_invoice_payments(invoice_id);
    `);
    console.log('✅ Index created successfully!');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkTableStructure() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Get table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'invoice_payments'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 invoice_payments table structure:');
    console.log(JSON.stringify(columns.rows, null, 2));
    
    // Try to fetch payments
    const payments = await pool.query(`
      SELECT * FROM invoice_payments LIMIT 1
    `);
    
    console.log('\n✅ Sample payment:');
    console.log(JSON.stringify(payments.rows[0], null, 2));
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkTableStructure();

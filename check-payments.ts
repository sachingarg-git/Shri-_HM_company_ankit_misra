import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkPayments() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'invoice_payments'
    `);
    
    console.log('✅ Table exists:', tableCheck.rows.length > 0);
    
    // Get all payments
    const payments = await pool.query(`
      SELECT ip.*, si.invoice_number 
      FROM invoice_payments ip
      LEFT JOIN sales_invoices si ON ip.invoice_id = si.id
      ORDER BY ip.created_at DESC
      LIMIT 20
    `);
    
    console.log('\n📊 All payments in database:');
    console.log(JSON.stringify(payments.rows, null, 2));
    
    // Get count
    const count = await pool.query('SELECT COUNT(*) as count FROM invoice_payments');
    console.log('\nTotal payments:', count.rows[0].count);
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkPayments();

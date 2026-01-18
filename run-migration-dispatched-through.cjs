// Migration to add dispatched_through column to sales_invoices table
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Adding dispatched_through column...');
    
    // Check if column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sales_invoices' AND column_name = 'dispatched_through'
    `);
    
    if (checkColumn.rows.length === 0) {
      // Add the column
      await client.query(`
        ALTER TABLE sales_invoices 
        ADD COLUMN dispatched_through TEXT
      `);
      console.log('✅ Column dispatched_through added to sales_invoices table');
    } else {
      console.log('ℹ️ Column dispatched_through already exists');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);

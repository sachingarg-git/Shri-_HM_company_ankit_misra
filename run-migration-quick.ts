import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running migration...');
    
    // Add columns to quotations
    await client.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS destination text`);
    console.log('✓ Added destination column to quotations');
    
    await client.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS loading_from text`);
    console.log('✓ Added loading_from column to quotations');
    
    // Add columns to sales_orders
    await client.query(`ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS destination text`);
    console.log('✓ Added destination column to sales_orders');
    
    await client.query(`ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS loading_from text`);
    console.log('✓ Added loading_from column to sales_orders');
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running migration: Adding freight_charged column to quotations...');
    
    // Add freight_charged column to quotations
    await client.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS freight_charged numeric(15, 2) DEFAULT '0'`);
    console.log('✓ Added freight_charged column to quotations');
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

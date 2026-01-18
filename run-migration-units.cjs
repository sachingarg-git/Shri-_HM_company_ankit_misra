const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running migration: Adding new unit_of_measurement enum values...');
    
    // Add new enum values to unit_of_measurement enum
    await client.query(`ALTER TYPE unit_of_measurement ADD VALUE IF NOT EXISTS 'LTR'`);
    console.log('✓ Added LTR to unit_of_measurement enum');
    
    await client.query(`ALTER TYPE unit_of_measurement ADD VALUE IF NOT EXISTS 'PIECES'`);
    console.log('✓ Added PIECES to unit_of_measurement enum');
    
    await client.query(`ALTER TYPE unit_of_measurement ADD VALUE IF NOT EXISTS 'UNIT'`);
    console.log('✓ Added UNIT to unit_of_measurement enum');
    
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

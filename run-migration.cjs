const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ankit_misra_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const sql = `
DO $$ BEGIN
  -- Add columns only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_agreements' AND column_name = 'customer_name') THEN
    ALTER TABLE "credit_agreements" ADD COLUMN "customer_name" text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_agreements' AND column_name = 'date') THEN
    ALTER TABLE "credit_agreements" ADD COLUMN "date" timestamp;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_agreements' AND column_name = 'location') THEN
    ALTER TABLE "credit_agreements" ADD COLUMN "location" text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_agreements' AND column_name = 'address') THEN
    ALTER TABLE "credit_agreements" ADD COLUMN "address" text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_agreements' AND column_name = 'pin_code') THEN
    ALTER TABLE "credit_agreements" ADD COLUMN "pin_code" text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_agreements' AND column_name = 'gstn_number') THEN
    ALTER TABLE "credit_agreements" ADD COLUMN "gstn_number" text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_agreements' AND column_name = 'cheque_numbers') THEN
    ALTER TABLE "credit_agreements" ADD COLUMN "cheque_numbers" text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_agreements' AND column_name = 'bank_name') THEN
    ALTER TABLE "credit_agreements" ADD COLUMN "bank_name" text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_agreements' AND column_name = 'branch_name') THEN
    ALTER TABLE "credit_agreements" ADD COLUMN "branch_name" text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_agreements' AND column_name = 'account_holder') THEN
    ALTER TABLE "credit_agreements" ADD COLUMN "account_holder" text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_agreements' AND column_name = 'account_number') THEN
    ALTER TABLE "credit_agreements" ADD COLUMN "account_number" text;
  END IF;
END $$;
`;

pool.query(sql, (err, res) => {
  if (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } else {
    console.log('Migration completed successfully');
    process.exit(0);
  }
});


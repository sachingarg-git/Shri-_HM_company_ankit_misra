-- Add new columns to quotations table
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS destination text;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS loading_from text;

-- Add new columns to sales_orders table
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS destination text;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS loading_from text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quotations_destination ON quotations(destination);
CREATE INDEX IF NOT EXISTS idx_sales_orders_destination ON sales_orders(destination);

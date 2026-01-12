-- Add new fields to credit_agreements table for credit agreement form
ALTER TABLE "credit_agreements" ADD COLUMN "customer_name" text;
ALTER TABLE "credit_agreements" ADD COLUMN "date" timestamp;
ALTER TABLE "credit_agreements" ADD COLUMN "location" text;
ALTER TABLE "credit_agreements" ADD COLUMN "address" text;
ALTER TABLE "credit_agreements" ADD COLUMN "pin_code" text;
ALTER TABLE "credit_agreements" ADD COLUMN "gstn_number" text;
ALTER TABLE "credit_agreements" ADD COLUMN "cheque_numbers" text;
ALTER TABLE "credit_agreements" ADD COLUMN "bank_name" text;
ALTER TABLE "credit_agreements" ADD COLUMN "branch_name" text;
ALTER TABLE "credit_agreements" ADD COLUMN "account_holder" text;
ALTER TABLE "credit_agreements" ADD COLUMN "account_number" text;

ALTER TABLE "sales" DROP CONSTRAINT "sales_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD COLUMN "customer_name" text;--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD COLUMN "date" timestamp;--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD COLUMN "pin_code" text;--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD COLUMN "gstn_number" text;--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD COLUMN "cheque_numbers" text;--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD COLUMN "branch_name" text;--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD COLUMN "account_holder" text;--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD COLUMN "account_number" text;--> statement-breakpoint
ALTER TABLE "purchase_invoices" ADD COLUMN "paid_amount" numeric(15, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_invoices" ADD COLUMN "remaining_balance" numeric(15, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD COLUMN "sales_order_number" text;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD COLUMN "lr_number" text;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD COLUMN "party_mobile_number" text;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD COLUMN "paid_amount" numeric(15, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD COLUMN "remaining_balance" numeric(15, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_product_id_product_master_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_master"("id") ON DELETE no action ON UPDATE no action;
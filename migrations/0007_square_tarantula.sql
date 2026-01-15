ALTER TABLE "quotations" ADD COLUMN "destination" text;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "loading_from" text;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "destination" text;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "loading_from" text;
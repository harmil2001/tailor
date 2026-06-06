CREATE TABLE "low_stock_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fabric_id" uuid NOT NULL,
	"available_meters" numeric(10, 3) NOT NULL,
	"total_meters" numeric(10, 3) NOT NULL,
	"acknowledged_at" timestamp,
	"acknowledged_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "low_stock_alerts" ADD CONSTRAINT "low_stock_alerts_fabric_id_fabrics_id_fk" FOREIGN KEY ("fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "low_stock_alerts" ADD CONSTRAINT "low_stock_alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
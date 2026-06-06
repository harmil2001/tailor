CREATE TYPE "public"."fabric_pattern" AS ENUM('Plain', 'Printed', 'Chequered', 'Striped', 'Dotted', 'Embroidered', 'Jacquard');
--> statement-breakpoint
CREATE TABLE "fabrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" text NOT NULL,
	"dealer_name" text NOT NULL,
	"color" text NOT NULL,
	"pattern" "fabric_pattern" NOT NULL,
	"purchase_price_per_meter" numeric(10, 2) NOT NULL,
	"selling_price_factor" numeric(10, 2) DEFAULT '1' NOT NULL,
	"total_meters" numeric(10, 3) NOT NULL,
	"available_meters" numeric(10, 3) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Backfill clothProvidedBy from the order-level column into each item in the JSONB array
--> statement-breakpoint
UPDATE "orders"
SET "items" = (
  SELECT jsonb_agg(item || jsonb_build_object('clothProvidedBy', "cloth_provided_by"::text))
  FROM jsonb_array_elements("items") AS item
);
--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "cloth_provided_by";
--> statement-breakpoint
DROP TYPE "public"."cloth_provided_by";

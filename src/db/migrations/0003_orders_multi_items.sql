ALTER TABLE "orders" ADD COLUMN "items" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
UPDATE "orders" SET "items" = jsonb_build_array(jsonb_build_object('name', item_name));
--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "item_name";

CREATE TABLE "dealers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "dealers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "dealer_ledger_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "dealer_id" uuid NOT NULL,
  "bill_date" date NOT NULL,
  "particulars" text NOT NULL,
  "voucher_type" text NOT NULL,
  "voucher_no" text NOT NULL,
  "credit_amount" numeric(12, 2),
  "debit_amount" numeric(12, 2),
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dealer_ledger_entries" ADD CONSTRAINT "dealer_ledger_entries_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE cascade ON UPDATE no action;

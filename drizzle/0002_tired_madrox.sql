CREATE TABLE "catalog_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_request_id" uuid NOT NULL,
	"provider_id" varchar(32) NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"merchant" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"source_url" text NOT NULL,
	"price_minor" bigint,
	"currency" varchar(10),
	"availability_status" varchar(32) DEFAULT 'UNKNOWN' NOT NULL,
	"raw_metadata" text,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"correlation_id" varchar(64) NOT NULL,
	"intent" text NOT NULL,
	"budget_minor" bigint,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"category" varchar(100),
	"preferred_merchant" varchar(100),
	"status" varchar(32) DEFAULT 'DRAFT' NOT NULL,
	"failure_reason" text,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "catalog_candidates" ADD CONSTRAINT "catalog_candidates_purchase_request_id_purchase_requests_id_fk" FOREIGN KEY ("purchase_request_id") REFERENCES "public"."purchase_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_created_by_principals_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."principals"("id") ON DELETE restrict ON UPDATE no action;
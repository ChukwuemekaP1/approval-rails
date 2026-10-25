CREATE TABLE "policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"max_transaction_amount" bigint NOT NULL,
	"monthly_budget_cap" bigint NOT NULL,
	"require_admin_above" bigint,
	"allowed_categories" text,
	"blocked_merchants" text,
	"canonical_content" text NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_created_by_principals_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."principals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "policies_ws_version_idx" ON "policies" USING btree ("workspace_id","version");
CREATE TABLE IF NOT EXISTS "baskets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"principal_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "baskets_ws_principal_idx" UNIQUE("workspace_id","principal_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "basket_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"basket_id" uuid NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"offer_id" varchar(255) NOT NULL,
	"provider_id" varchar(32) DEFAULT 'channel3' NOT NULL,
	"title" text NOT NULL,
	"brand" varchar(255),
	"category" varchar(100),
	"description" text,
	"merchant" varchar(255) NOT NULL,
	"source_url" text NOT NULL,
	"image_url" text,
	"unit_price_minor" bigint NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"selected" boolean DEFAULT true NOT NULL,
	"availability_status" varchar(32) DEFAULT 'IN_STOCK' NOT NULL,
	"raw_metadata" jsonb,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(32) DEFAULT 'PURCHASER' NOT NULL,
	"token" varchar(255) NOT NULL UNIQUE,
	"invited_by" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member_spending_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"principal_id" uuid NOT NULL,
	"monthly_budget_minor" bigint,
	"max_transaction_minor" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_limits_ws_principal_idx" UNIQUE("workspace_id","principal_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"proposal_id" uuid NOT NULL,
	"approver_id" uuid NOT NULL,
	"decision" varchar(32) NOT NULL,
	"reason" text,
	"terms_hash" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "baskets" ADD CONSTRAINT "baskets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "baskets" ADD CONSTRAINT "baskets_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "public"."principals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "basket_items" ADD CONSTRAINT "basket_items_basket_id_baskets_id_fk" FOREIGN KEY ("basket_id") REFERENCES "public"."baskets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_invited_by_principals_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."principals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "member_spending_limits" ADD CONSTRAINT "member_spending_limits_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "member_spending_limits" ADD CONSTRAINT "member_spending_limits_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "public"."principals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "approvals" ADD CONSTRAINT "approvals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "approvals" ADD CONSTRAINT "approvals_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approver_id_principals_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."principals"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "basket_items_basket_idx" ON "basket_items" USING btree ("basket_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_workspace_idx" ON "workspace_invitations" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_token_idx" ON "workspace_invitations" USING btree ("token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "approvals_workspace_idx" ON "approvals" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "approvals_proposal_idx" ON "approvals" USING btree ("proposal_id");

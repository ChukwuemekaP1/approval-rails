CREATE TABLE "proposal_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"title" text NOT NULL,
	"merchant" varchar(255) NOT NULL,
	"source_url" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_minor" bigint NOT NULL,
	"total_price_minor" bigint NOT NULL,
	"currency" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"requester_id" uuid NOT NULL,
	"source_request_id" uuid NOT NULL,
	"merchant" varchar(255) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"total_amount_minor" bigint NOT NULL,
	"status" varchar(32) DEFAULT 'DRAFT' NOT NULL,
	"policy_version" integer NOT NULL,
	"policy_hash" varchar(64) NOT NULL,
	"policy_evaluation" text NOT NULL,
	"canonical_terms_json" text NOT NULL,
	"terms_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"authorized_at" timestamp with time zone,
	"authorized_by" uuid,
	"authorization_assertion" text,
	"auth_challenge" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "proposal_line_items" ADD CONSTRAINT "proposal_line_items_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_line_items" ADD CONSTRAINT "proposal_line_items_candidate_id_catalog_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."catalog_candidates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_requester_id_principals_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."principals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_source_request_id_purchase_requests_id_fk" FOREIGN KEY ("source_request_id") REFERENCES "public"."purchase_requests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_authorized_by_principals_id_fk" FOREIGN KEY ("authorized_by") REFERENCES "public"."principals"("id") ON DELETE set null ON UPDATE no action;
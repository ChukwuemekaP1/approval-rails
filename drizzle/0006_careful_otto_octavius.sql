CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"stream_id" text NOT NULL,
	"correlation_id" text NOT NULL,
	"sequence" integer NOT NULL,
	"event_type" varchar(64) NOT NULL,
	"actor_kind" varchar(32) NOT NULL,
	"actor_id" varchar(255) NOT NULL,
	"actor_name" varchar(255),
	"payload" jsonb NOT NULL,
	"prev_hash" varchar(64) NOT NULL,
	"hash" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "stream_sequence_idx" ON "ledger_entries" USING btree ("stream_id","sequence");--> statement-breakpoint
CREATE INDEX "ledger_workspace_idx" ON "ledger_entries" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "ledger_correlation_idx" ON "ledger_entries" USING btree ("correlation_id");--> statement-breakpoint
CREATE OR REPLACE FUNCTION prevent_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Ledger entries are strictly append-only and cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER trg_ledger_entries_immutable
BEFORE UPDATE OR DELETE ON "ledger_entries"
FOR EACH ROW
EXECUTE FUNCTION prevent_ledger_mutation();

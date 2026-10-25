export type LedgerEventType =
  | 'REQUEST_CREATED'
  | 'RESEARCH_COMPLETED'
  | 'PROPOSAL_CREATED'
  | 'PROPOSAL_REVISED'
  | 'POLICY_DENIED'
  | 'TERMS_SEALED'
  | 'AUTHORIZATION_VERIFIED'
  | 'ORDER_CREATED'
  | 'CAPTURE_REQUESTED'
  | 'CAPTURE_COMPLETED'
  | 'CAPTURE_FAILED'
  | 'CAPTURE_UNKNOWN'
  | 'WEBHOOK_PROCESSED'
  | 'RECONCILIATION_COMPLETED';

export type ActorKind = 'USER' | 'SYSTEM' | 'PROVIDER' | 'POLICY_ENGINE';

export interface LedgerActor {
  kind: ActorKind;
  id: string;
  name?: string;
}

export interface LedgerEntry {
  id: string;
  workspaceId: string;
  streamId: string;
  correlationId: string;
  sequence: number;
  eventType: LedgerEventType;
  actor: LedgerActor;
  payload: Record<string, unknown>;
  prevHash: string;
  hash: string;
  timestamp: string;
}

export interface LedgerFilter {
  workspaceId?: string;
  streamId?: string;
  correlationId?: string;
  eventType?: LedgerEventType;
  limit?: number;
  offset?: number;
}

export interface EvidenceBundle {
  schemaVersion: '1.0.0';
  exportedAt: string;
  workspaceId: string;
  streamId: string;
  correlationId: string;
  totalEvents: number;
  headHash: string;
  events: LedgerEntry[];
}

export interface VerificationResult {
  valid: boolean;
  reasonCode?:
    | 'VALID'
    | 'EMPTY_BUNDLE'
    | 'INVALID_GENESIS'
    | 'SEQUENCE_GAP'
    | 'PREV_HASH_MISMATCH'
    | 'HASH_MISMATCH'
    | 'HEAD_HASH_MISMATCH'
    | 'INVALID_STRUCTURE';
  error?: string;
  verifiedCount: number;
  brokenSequence?: number;
}

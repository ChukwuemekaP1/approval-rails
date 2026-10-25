import {
  LedgerActor,
  LedgerEntry,
  LedgerEventType,
  LedgerFilter,
  EvidenceBundle,
} from '@/domain/ledger/types';

export interface AppendEventParams {
  workspaceId: string;
  streamId: string;
  correlationId: string;
  eventType: LedgerEventType;
  actor: LedgerActor;
  payload: Record<string, unknown>;
  timestamp?: string;
}

export interface LedgerPort {
  appendEvent(params: AppendEventParams): Promise<LedgerEntry>;
  listByWorkspace(workspaceId: string, filter?: LedgerFilter): Promise<LedgerEntry[]>;
  listByStream(streamId: string): Promise<LedgerEntry[]>;
  exportEvidenceBundle(workspaceId: string, streamId: string): Promise<EvidenceBundle>;
}

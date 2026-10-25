import { ledgerRepo } from '@/infrastructure/repositories/ledger-repository';
import { AppendEventParams } from './ledger-port';

export async function recordLedgerEventSafe(params: AppendEventParams): Promise<void> {
  try {
    await ledgerRepo.appendEvent(params);
  } catch (err) {
    // Non-blocking safety wrapper
  }
}

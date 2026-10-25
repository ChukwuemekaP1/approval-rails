import { CurrencyCode } from '../money/currency';
import { ProposalLineItem } from './types';
import { CatalogCandidateSnapshot } from '../catalog/types';

export interface BasketItemInput {
  candidateId: string;
  quantity: number;
}

export function buildLineItemsFromCandidates(
  inputs: BasketItemInput[],
  candidates: CatalogCandidateSnapshot[]
): {
  items: ProposalLineItem[];
  merchant: string;
  currency: CurrencyCode;
  totalAmountMinor: bigint;
} {
  if (inputs.length === 0) {
    throw new Error('Basket must contain at least one line item');
  }

  const candidateMap = new Map<string, CatalogCandidateSnapshot>();
  for (const c of candidates) {
    candidateMap.set(c.id, c);
  }

  let merchant: string | null = null;
  let currency: CurrencyCode | null = null;
  let totalAmountMinor = 0n;
  const items: ProposalLineItem[] = [];

  for (const input of inputs) {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      throw new Error(`Invalid item quantity: ${input.quantity}. Must be a positive integer.`);
    }

    const candidate = candidateMap.get(input.candidateId);
    if (!candidate) {
      throw new Error(`Candidate with ID "${input.candidateId}" not found in snapshot`);
    }

    if (candidate.priceMinor === null || !candidate.currency) {
      throw new Error(`Candidate "${candidate.title}" does not have confirmed pricing`);
    }

    // Enforce merchant consistency
    if (merchant === null) {
      merchant = candidate.merchant;
    } else if (merchant !== candidate.merchant) {
      throw new Error(
        `Disparate merchants in single proposal: "${merchant}" vs "${candidate.merchant}"`
      );
    }

    // Enforce currency consistency
    if (currency === null) {
      currency = candidate.currency;
    } else if (currency !== candidate.currency) {
      throw new Error(
        `Disparate currencies in single proposal: "${currency}" vs "${candidate.currency}"`
      );
    }

    const qtyBigInt = BigInt(input.quantity);
    const itemTotal = candidate.priceMinor * qtyBigInt;
    totalAmountMinor += itemTotal;

    items.push({
      id: crypto.randomUUID(),
      candidateId: candidate.id,
      title: candidate.title,
      merchant: candidate.merchant,
      sourceUrl: candidate.sourceUrl,
      quantity: input.quantity,
      unitPriceMinor: candidate.priceMinor,
      totalPriceMinor: itemTotal,
      currency: candidate.currency,
    });
  }

  return {
    items,
    merchant: merchant!,
    currency: currency!,
    totalAmountMinor,
  };
}

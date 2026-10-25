export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyMetadata {
  code: CurrencyCode;
  decimals: number;
  symbol: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyMetadata> = {
  USD: { code: 'USD', decimals: 2, symbol: '$' },
  EUR: { code: 'EUR', decimals: 2, symbol: '€' },
  GBP: { code: 'GBP', decimals: 2, symbol: '£' },
  CAD: { code: 'CAD', decimals: 2, symbol: 'CA$' },
  AUD: { code: 'AUD', decimals: 2, symbol: 'A$' },
  JPY: { code: 'JPY', decimals: 0, symbol: '¥' },
};

export interface Money {
  amount: bigint; // Integer minor units (e.g. cents, pence, yen)
  currency: CurrencyCode;
}

/**
 * Parses a decimal string (e.g. "125.50" or "100") into authoritative integer minor units (bigint).
 * Strictly avoids IEEE-754 floating point arithmetic.
 */
export function parseDecimalToMinorUnits(
  decimalStr: string,
  currency: CurrencyCode
): bigint {
  const meta = SUPPORTED_CURRENCIES[currency];
  if (!meta) {
    throw new Error(`Unsupported currency code: ${currency}`);
  }

  const trimmed = decimalStr.trim();
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Invalid decimal amount string: "${decimalStr}"`);
  }

  const [wholePart, rawFraction = ''] = trimmed.split('.');

  // If currency has 0 decimals (like JPY), fractional parts are invalid
  if (meta.decimals === 0) {
    if (rawFraction.length > 0 && BigInt(rawFraction) > 0n) {
      throw new Error(`Currency ${currency} does not support fractional units`);
    }
    return BigInt(wholePart);
  }

  // Truncate or pad fraction to currency decimal places
  let fractionPart = rawFraction.slice(0, meta.decimals);
  while (fractionPart.length < meta.decimals) {
    fractionPart += '0';
  }

  return BigInt(wholePart) * BigInt(10 ** meta.decimals) + BigInt(fractionPart);
}

/**
 * Formats integer minor units into an authoritative decimal string representation.
 */
export function formatMinorUnitsToDecimal(
  amount: bigint,
  currency: CurrencyCode
): string {
  const meta = SUPPORTED_CURRENCIES[currency];
  if (!meta) {
    throw new Error(`Unsupported currency code: ${currency}`);
  }

  const isNegative = amount < 0n;
  const absAmount = isNegative ? -amount : amount;

  if (meta.decimals === 0) {
    return `${isNegative ? '-' : ''}${absAmount.toString()}`;
  }

  const divisor = BigInt(10 ** meta.decimals);
  const wholePart = absAmount / divisor;
  const fractionPart = absAmount % divisor;

  const paddedFraction = fractionPart.toString().padStart(meta.decimals, '0');
  return `${isNegative ? '-' : ''}${wholePart.toString()}.${paddedFraction}`;
}

export function compareMoney(a: Money, b: Money): number {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot compare disparate currencies: ${a.currency} vs ${b.currency}`);
  }
  if (a.amount < b.amount) return -1;
  if (a.amount > b.amount) return 1;
  return 0;
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add disparate currencies: ${a.currency} vs ${b.currency}`);
  }
  return {
    amount: a.amount + b.amount,
    currency: a.currency,
  };
}

export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot subtract disparate currencies: ${a.currency} vs ${b.currency}`);
  }
  return {
    amount: a.amount - b.amount,
    currency: a.currency,
  };
}

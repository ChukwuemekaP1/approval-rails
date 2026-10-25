import { describe, it, expect } from 'vitest';
import {
  parseDecimalToMinorUnits,
  formatMinorUnitsToDecimal,
  compareMoney,
  addMoney,
  subtractMoney,
  SUPPORTED_CURRENCIES,
} from '@/domain/money/currency';

describe('Domain: Money & Currency Calculations', () => {
  describe('parseDecimalToMinorUnits', () => {
    it('correctly parses 2-decimal currencies (USD, EUR, GBP)', () => {
      expect(parseDecimalToMinorUnits('100.50', 'USD')).toBe(10050n);
      expect(parseDecimalToMinorUnits('100', 'USD')).toBe(10000n);
      expect(parseDecimalToMinorUnits('0.99', 'EUR')).toBe(99n);
      expect(parseDecimalToMinorUnits('0.05', 'GBP')).toBe(5n);
      expect(parseDecimalToMinorUnits('0.00', 'USD')).toBe(0n);
      expect(parseDecimalToMinorUnits('0', 'USD')).toBe(0n);
      expect(parseDecimalToMinorUnits('1234567.89', 'CAD')).toBe(123456789n);
    });

    it('correctly parses 0-decimal currencies (JPY)', () => {
      expect(parseDecimalToMinorUnits('1500', 'JPY')).toBe(1500n);
      expect(parseDecimalToMinorUnits('0', 'JPY')).toBe(0n);
      expect(parseDecimalToMinorUnits('999999', 'JPY')).toBe(999999n);
    });

    it('rejects fractional amounts for 0-decimal currencies', () => {
      expect(() => parseDecimalToMinorUnits('1500.50', 'JPY')).toThrow(
        /does not support fractional units/i
      );
      expect(() => parseDecimalToMinorUnits('10.1', 'JPY')).toThrow(
        /does not support fractional units/i
      );
    });

    it('truncates or pads excess decimal precision deterministically', () => {
      // 10.559 -> 10.55 for 2-decimal currency
      expect(parseDecimalToMinorUnits('10.559', 'USD')).toBe(1055n);
      // 10.5 -> 10.50 -> 1050n
      expect(parseDecimalToMinorUnits('10.5', 'USD')).toBe(1050n);
    });

    it('rejects negative, malformed, or empty decimal strings', () => {
      expect(() => parseDecimalToMinorUnits('-10.00', 'USD')).toThrow(/Invalid decimal/);
      expect(() => parseDecimalToMinorUnits('abc', 'USD')).toThrow(/Invalid decimal/);
      expect(() => parseDecimalToMinorUnits('', 'USD')).toThrow(/Invalid decimal/);
      expect(() => parseDecimalToMinorUnits('10.20.30', 'USD')).toThrow(/Invalid decimal/);
    });
  });

  describe('formatMinorUnitsToDecimal', () => {
    it('formats 2-decimal currency amounts accurately', () => {
      expect(formatMinorUnitsToDecimal(10050n, 'USD')).toBe('100.50');
      expect(formatMinorUnitsToDecimal(10000n, 'USD')).toBe('100.00');
      expect(formatMinorUnitsToDecimal(99n, 'EUR')).toBe('0.99');
      expect(formatMinorUnitsToDecimal(5n, 'GBP')).toBe('0.05');
      expect(formatMinorUnitsToDecimal(0n, 'USD')).toBe('0.00');
    });

    it('formats negative amounts accurately with minus sign', () => {
      expect(formatMinorUnitsToDecimal(-10050n, 'USD')).toBe('-100.50');
      expect(formatMinorUnitsToDecimal(-5n, 'USD')).toBe('-0.05');
    });

    it('formats 0-decimal currency amounts accurately', () => {
      expect(formatMinorUnitsToDecimal(1500n, 'JPY')).toBe('1500');
      expect(formatMinorUnitsToDecimal(-500n, 'JPY')).toBe('-500');
      expect(formatMinorUnitsToDecimal(0n, 'JPY')).toBe('0');
    });
  });

  describe('compareMoney', () => {
    it('accurately orders monetary amounts of the same currency', () => {
      expect(compareMoney({ amount: 100n, currency: 'USD' }, { amount: 200n, currency: 'USD' })).toBe(-1);
      expect(compareMoney({ amount: 200n, currency: 'USD' }, { amount: 100n, currency: 'USD' })).toBe(1);
      expect(compareMoney({ amount: 150n, currency: 'USD' }, { amount: 150n, currency: 'USD' })).toBe(0);
    });

    it('throws when comparing disparate currencies', () => {
      expect(() =>
        compareMoney({ amount: 100n, currency: 'USD' }, { amount: 100n, currency: 'EUR' })
      ).toThrow(/Cannot compare disparate currencies/);
    });
  });

  describe('addMoney and subtractMoney', () => {
    it('adds amounts without IEEE-754 precision artifacts', () => {
      // In IEEE-754 binary float, 0.1 + 0.2 = 0.30000000000000004
      // In minor units, 10n + 20n = 30n exactly.
      const tenCents = { amount: 10n, currency: 'USD' as const };
      const twentyCents = { amount: 20n, currency: 'USD' as const };
      const result = addMoney(tenCents, twentyCents);
      expect(result.amount).toBe(30n);
      expect(formatMinorUnitsToDecimal(result.amount, result.currency)).toBe('0.30');
    });

    it('subtracts amounts accurately', () => {
      const a = { amount: 5000n, currency: 'GBP' as const };
      const b = { amount: 1250n, currency: 'GBP' as const };
      const result = subtractMoney(a, b);
      expect(result.amount).toBe(3750n);
      expect(formatMinorUnitsToDecimal(result.amount, result.currency)).toBe('37.50');
    });

    it('throws when performing arithmetic on disparate currencies', () => {
      expect(() =>
        addMoney({ amount: 100n, currency: 'USD' }, { amount: 100n, currency: 'EUR' })
      ).toThrow(/Cannot add disparate currencies/);

      expect(() =>
        subtractMoney({ amount: 100n, currency: 'USD' }, { amount: 100n, currency: 'CAD' })
      ).toThrow(/Cannot subtract disparate currencies/);
    });
  });
});

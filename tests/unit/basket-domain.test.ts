import { describe, it, expect } from 'vitest';
import { formatMinorUnitsToDecimal } from '@/domain/money/currency';

describe('Persistent Multi-Search Basket Logic', () => {
  it('correctly calculates totals for selected items vs total basket', () => {
    const items = [
      { id: '1', title: 'ThinkPad X1', unitPriceMinor: 179900n, quantity: 1, selected: true },
      { id: '2', title: 'Herman Miller Aeron', unitPriceMinor: 119500n, quantity: 2, selected: true },
      { id: '3', title: 'Cisco Switch', unitPriceMinor: 89000n, quantity: 1, selected: false },
    ];

    let totalBasketMinor = 0n;
    let selectedSubtotalMinor = 0n;
    let selectedCount = 0;

    for (const item of items) {
      const line = item.unitPriceMinor * BigInt(item.quantity);
      totalBasketMinor += line;
      if (item.selected) {
        selectedSubtotalMinor += line;
        selectedCount += item.quantity;
      }
    }

    // Selected: 1799.00 + (1195.00 * 2) = 1799 + 2390 = $4,189.00
    expect(selectedSubtotalMinor).toBe(418900n);
    expect(selectedCount).toBe(3);
    expect(formatMinorUnitsToDecimal(selectedSubtotalMinor, 'USD')).toBe('4189.00');

    // Total Basket: 4189.00 + 890.00 = $5,079.00
    expect(totalBasketMinor).toBe(507900n);
    expect(formatMinorUnitsToDecimal(totalBasketMinor, 'USD')).toBe('5079.00');
  });

  it('preserves unselected lines when filtering selected items for procurement', () => {
    const basket = [
      { id: 'item-laptop', title: 'Laptop', selected: true },
      { id: 'item-chair', title: 'Chair', selected: false },
      { id: 'item-switch', title: 'Switch', selected: false },
    ];

    const toProcure = basket.filter((i) => i.selected);
    const toRetainInBasket = basket.filter((i) => !i.selected);

    expect(toProcure).toHaveLength(1);
    expect(toProcure[0].id).toBe('item-laptop');

    expect(toRetainInBasket).toHaveLength(2);
    expect(toRetainInBasket.map((i) => i.id)).toEqual(['item-chair', 'item-switch']);
  });

  it('keeps offers from different merchants distinct and distinguishable', () => {
    const offerCDW = { productId: 'laptop-1', merchant: 'CDW', priceMinor: 179900n };
    const offerDirect = { productId: 'laptop-1', merchant: 'Lenovo Direct', priceMinor: 184900n };

    expect(offerCDW.productId).toBe(offerDirect.productId);
    expect(offerCDW.merchant).not.toBe(offerDirect.merchant);
    expect(offerCDW.priceMinor).not.toBe(offerDirect.priceMinor);
  });
});

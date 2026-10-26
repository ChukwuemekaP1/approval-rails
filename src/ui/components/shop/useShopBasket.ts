'use client';

import { useState, useCallback, useEffect } from 'react';
import { DiscoveredProduct, DiscoveredOffer } from '@/domain/catalog/discovery-types';

export function useShopBasket(workspaceId?: string) {
  const [basketCount, setBasketCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchBasketCount = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/basket`);
      if (res.ok) {
        const data = await res.json();
        setBasketCount(data.totalItemsCount || 0);
      }
    } catch {}
  }, [workspaceId]);

  useEffect(() => {
    fetchBasketCount();
  }, [fetchBasketCount]);

  const addOfferToBasket = async (prod: DiscoveredProduct, offer: DiscoveredOffer) => {
    if (!workspaceId) return false;
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/basket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prod.id,
          offerId: offer.id,
          title: prod.title,
          brand: prod.brand,
          category: prod.category,
          description: prod.description,
          merchant: offer.merchant,
          sourceUrl: offer.buyUrl,
          imageUrl: prod.primaryImage,
          unitPriceMinor: String(offer.priceMinor),
          currency: offer.currency,
          quantity: 1,
        }),
      });
      if (res.ok) {
        setFeedback(`Added "${prod.title.slice(0, 30)}..." to basket`);
        fetchBasketCount();
        setTimeout(() => setFeedback(null), 3000);
        return true;
      }
    } catch {}
    return false;
  };

  return { basketCount, feedback, addOfferToBasket };
}

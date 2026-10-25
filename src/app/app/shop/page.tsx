'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { DiscoveredProduct, DiscoveredOffer } from '@/domain/catalog/discovery-types';
import { CategoryChips } from '@/ui/components/shop/CategoryChips';
import { ProductCard } from '@/ui/components/shop/ProductCard';
import { OfferModal } from '@/ui/components/shop/OfferModal';
import { ShopHeader } from '@/ui/components/shop/ShopHeader';

export default function ShopPage() {
  const { activeWorkspace } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<DiscoveredProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveChannel3, setIsLiveChannel3] = useState(false);
  const [selectedProductForOffers, setSelectedProductForOffers] = useState<DiscoveredProduct | null>(null);
  const [basketCount, setBasketCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchBasketCount = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/basket`);
      if (res.ok) {
        const data = await res.json();
        setBasketCount(data.totalItemsCount || 0);
      }
    } catch {}
  }, [activeWorkspace?.id]);

  const searchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (selectedCategory) params.set('category', selectedCategory);
      params.set('limit', '12');

      const res = await fetch(`/api/v1/catalog/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setIsLiveChannel3(Boolean(data.isLiveChannel3));
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(), 300);
    return () => clearTimeout(timer);
  }, [searchProducts]);

  useEffect(() => {
    fetchBasketCount();
  }, [fetchBasketCount]);

  const handleAddOffer = async (product: DiscoveredProduct, offer: DiscoveredOffer) => {
    if (!activeWorkspace?.id) return;
    try {
      const res = await fetch(`/api/v1/workspaces/${activeWorkspace.id}/basket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          offerId: offer.id,
          title: product.title,
          brand: product.brand,
          category: product.category,
          description: product.description,
          merchant: offer.merchant,
          sourceUrl: offer.buyUrl,
          imageUrl: product.primaryImage,
          unitPriceMinor: String(offer.priceMinor),
          currency: offer.currency,
          quantity: 1,
        }),
      });

      if (res.ok) {
        setFeedback(`Added "${product.title.slice(0, 30)}..." to basket`);
        fetchBasketCount();
        setSelectedProductForOffers(null);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error('Add to basket failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <ShopHeader
        query={query}
        setQuery={setQuery}
        basketCount={basketCount}
        isLiveChannel3={isLiveChannel3}
      />

      {feedback && (
        <div className="p-3 rounded-xl bg-teal-50 text-teal-800 text-xs flex items-center gap-2 border border-teal-200">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <CategoryChips selectedCategory={selectedCategory} onSelect={setSelectedCategory} />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
          <span className="text-xs">Searching verified catalog...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewOffers={setSelectedProductForOffers}
              onQuickAdd={(p) => handleAddOffer(p, p.offers[0])}
            />
          ))}
        </div>
      )}

      <OfferModal
        product={selectedProductForOffers}
        onClose={() => setSelectedProductForOffers(null)}
        onSelectOffer={handleAddOffer}
      />
    </div>
  );
}

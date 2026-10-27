'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/ui/context/AuthContext';
import { DiscoveredProduct } from '@/domain/catalog/discovery-types';
import { CategoryChips } from '@/ui/components/shop/CategoryChips';
import { OfferModal } from '@/ui/components/shop/OfferModal';
import { ShopHeader } from '@/ui/components/shop/ShopHeader';
import { ProductRefinementCard, RefinementValues } from '@/ui/components/shop/ProductRefinementCard';
import { ShopStatusBanner } from '@/ui/components/shop/ShopStatusBanner';
import { ProductGrid } from '@/ui/components/shop/ProductGrid';
import { useShopBasket } from '@/ui/components/shop/useShopBasket';

export default function ShopPage() {
  const { activeWorkspace } = useAuth();
  const { basketCount, feedback, addOfferToBasket } = useShopBasket(activeWorkspace?.id);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [products, setProducts] = useState<DiscoveredProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveChannel3, setIsLiveChannel3] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DiscoveredProduct | null>(null);

  const executeSearch = async (searchTerm: string, filters?: RefinementValues) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('q', searchTerm.trim());
      if (selectedCategory) params.set('category', selectedCategory);
      if (filters?.brand) params.set('brand', filters.brand);
      if (filters?.minPrice) params.set('minPrice', filters.minPrice);
      if (filters?.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters?.condition && filters.condition !== 'ANY') params.set('condition', filters.condition);
      params.set('limit', '12');

      const res = await fetch(`/api/v1/catalog/search?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      const safeProducts = (Array.isArray(data.products) ? data.products : []).map((p: any) => ({
        ...p,
        title: String(p?.title ?? ''),
        offers: Array.isArray(p?.offers) ? p.offers : [],
      }));
      setProducts(safeProducts);
      setIsLiveChannel3(Boolean(data.isLiveChannel3));
      const problem = data.error ?? (!res.ok ? data.detail ?? data.title ?? `Search failed (${res.status})` : null);
      if (problem) setError(typeof problem === 'string' ? problem : JSON.stringify(problem));
    } catch (err: any) {
      setError(err?.message || 'Search request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (q.split(/\s+/).length <= 2 && !q.includes(',') && !isRefining) {
      setIsRefining(true);
    } else {
      setIsRefining(false);
      executeSearch(q);
    }
  };

  return (
    <div className="space-y-6">
      <ShopHeader
        query={query}
        setQuery={setQuery}
        onSubmit={handleHeaderSubmit}
        onToggleRefine={() => setIsRefining(!isRefining)}
        isRefining={isRefining}
        basketCount={basketCount}
        isLiveChannel3={isLiveChannel3}
      />

      {isRefining && (
        <ProductRefinementCard
          initialQuery={query}
          onSearch={(q, f) => {
            setIsRefining(false);
            executeSearch(q, f);
          }}
          onSkip={() => {
            setIsRefining(false);
            executeSearch(query);
          }}
          onCancel={() => setIsRefining(false)}
        />
      )}

      {feedback && (
        <div className="p-3 rounded-xl bg-teal-50 text-teal-800 text-xs flex items-center gap-2 border border-teal-200">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <CategoryChips
        selectedCategory={selectedCategory}
        onSelect={(cat) => {
          setSelectedCategory(cat);
          if (query.trim() || cat) executeSearch(query.trim());
        }}
      />

      <ShopStatusBanner
        error={error}
        isLoading={isLoading}
        productsCount={products.length}
        hasSearched={hasSearched}
        onRetry={() => executeSearch(query)}
      />

      {!isLoading && !error && (
        <ProductGrid
          products={products}
          onViewOffers={setSelectedProduct}
          onQuickAdd={(p) => addOfferToBasket(p, p.offers[0])}
        />
      )}

      <OfferModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectOffer={async (p, off) => {
          const ok = await addOfferToBasket(p, off);
          if (ok) setSelectedProduct(null);
        }}
      />
    </div>
  );
}

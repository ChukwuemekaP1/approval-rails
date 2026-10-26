'use client';

import React from 'react';
import { DiscoveredProduct } from '@/domain/catalog/discovery-types';
import { ProductCard } from './ProductCard';

interface Props {
  products: DiscoveredProduct[];
  onViewOffers: (p: DiscoveredProduct) => void;
  onQuickAdd: (p: DiscoveredProduct) => void;
}

export function ProductGrid({ products, onViewOffers, onQuickAdd }: Props) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onViewOffers={onViewOffers}
          onQuickAdd={onQuickAdd}
        />
      ))}
    </div>
  );
}

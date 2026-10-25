import { CatalogProvider } from '@/application/ports/catalog-provider';
import { CatalogSearchQuery, CatalogSearchResult, CatalogCandidateSnapshot } from '@/domain/catalog/types';
import crypto from 'crypto';

export class FixtureCatalogAdapter implements CatalogProvider {
  readonly providerId = 'fixture' as const;

  isConfigured(): boolean {
    return true;
  }

  async search(query: CatalogSearchQuery, purchaseRequestId: string): Promise<CatalogSearchResult> {
    const q = query.query.toLowerCase();
    const all = this.getStandardFixtures(purchaseRequestId);
    const filtered = all.filter(
      (item) => item.title.toLowerCase().includes(q) || item.merchant.toLowerCase().includes(q)
    );

    const candidates = filtered.length > 0 ? filtered : all.slice(0, 3);
    const limit = query.limit || 5;

    return {
      providerId: 'fixture',
      candidates: candidates.slice(0, limit),
      totalObserved: candidates.length,
    };
  }

  async getDetails(externalId: string, purchaseRequestId: string): Promise<CatalogCandidateSnapshot | null> {
    const all = this.getStandardFixtures(purchaseRequestId);
    return all.find((item) => item.externalId === externalId) || null;
  }

  getStandardFixtures(purchaseRequestId: string): CatalogCandidateSnapshot[] {
    const now = new Date();
    return [
      {
        id: crypto.randomUUID(),
        purchaseRequestId,
        providerId: 'fixture',
        externalId: 'fix-ergonomic-chair-01',
        merchant: 'OfficePro Direct',
        title: 'Ergonomic Mesh Task Chair with Adjustable Lumbar',
        description: 'High-density breathable mesh back with 3D armrests and multi-tilt lock mechanism.',
        sourceUrl: 'https://officepro.example.com/products/ergonomic-mesh-chair',
        priceMinor: 24900n, // $249.00
        currency: 'USD',
        availabilityStatus: 'IN_STOCK',
        rawMetadata: { sku: 'OP-CHAIR-BLK-01', brand: 'OfficePro' },
        observedAt: now,
      },
      {
        id: crypto.randomUUID(),
        purchaseRequestId,
        providerId: 'fixture',
        externalId: 'fix-standing-desk-02',
        merchant: 'Workspace Direct',
        title: 'Dual-Motor Electric Standing Desk 55x28',
        description: 'Memory keypad with 4 presets, steel frame, anti-collision sensor, weight cap 220 lbs.',
        sourceUrl: 'https://workspacedirect.example.com/products/dual-motor-standing-desk',
        priceMinor: 38900n, // $389.00
        currency: 'USD',
        availabilityStatus: 'IN_STOCK',
        rawMetadata: { sku: 'WD-DESK-55-WAL', brand: 'WorkspacePro' },
        observedAt: now,
      },
      {
        id: crypto.randomUUID(),
        purchaseRequestId,
        providerId: 'fixture',
        externalId: 'fix-noise-cancelling-headphones-03',
        merchant: 'TechSupply Hub',
        title: 'Wireless Active Noise-Cancelling Headphones Pro',
        description: '40mm custom drivers, 30-hour battery life, multipoint Bluetooth connection.',
        sourceUrl: 'https://techsupply.example.com/products/anc-headphones-pro',
        priceMinor: 17950n, // $179.50
        currency: 'USD',
        availabilityStatus: 'IN_STOCK',
        rawMetadata: { sku: 'TS-ANC-HP3', brand: 'AcousticTech' },
        observedAt: now,
      },
    ];
  }
}

export const fixtureCatalogAdapter = new FixtureCatalogAdapter();

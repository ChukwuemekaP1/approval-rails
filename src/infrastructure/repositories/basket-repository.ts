import { eq, and } from 'drizzle-orm';
import { getDb } from '../db';
import { baskets, basketItems } from '../db/schema-basket';

export interface BasketItemRecord {
  id: string;
  basketId: string;
  productId: string;
  offerId: string;
  providerId: string;
  title: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  merchant: string;
  sourceUrl: string;
  imageUrl: string | null;
  unitPriceMinor: bigint;
  currency: string;
  quantity: number;
  selected: boolean;
  availabilityStatus: string;
  rawMetadata?: any;
  observedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class BasketRepository {
  async getOrCreateBasket(workspaceId: string, principalId: string): Promise<string> {
    const db = getDb();
    const existing = await db
      .select({ id: baskets.id })
      .from(baskets)
      .where(and(eq(baskets.workspaceId, workspaceId), eq(baskets.principalId, principalId)))
      .limit(1);

    if (existing.length > 0) return existing[0].id;

    const inserted = await db
      .insert(baskets)
      .values({ workspaceId, principalId })
      .returning({ id: baskets.id });

    return inserted[0].id;
  }

  async listItems(basketId: string): Promise<BasketItemRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(basketItems)
      .where(eq(basketItems.basketId, basketId))
      .orderBy(basketItems.createdAt);

    return rows as unknown as BasketItemRecord[];
  }

  async addItem(
    basketId: string,
    item: Omit<BasketItemRecord, 'id' | 'basketId' | 'createdAt' | 'updatedAt'>
  ): Promise<BasketItemRecord> {
    const db = getDb();
    const existing = await db
      .select()
      .from(basketItems)
      .where(
        and(
          eq(basketItems.basketId, basketId),
          eq(basketItems.productId, item.productId),
          eq(basketItems.merchant, item.merchant)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(basketItems)
        .set({
          quantity: existing[0].quantity + item.quantity,
          unitPriceMinor: item.unitPriceMinor,
          updatedAt: new Date(),
        })
        .where(eq(basketItems.id, existing[0].id))
        .returning();

      return updated[0] as unknown as BasketItemRecord;
    }

    const inserted = await db
      .insert(basketItems)
      .values({
        basketId,
        ...item,
      })
      .returning();

    return inserted[0] as unknown as BasketItemRecord;
  }

  async updateItem(
    itemId: string,
    updates: { quantity?: number; selected?: boolean }
  ): Promise<BasketItemRecord | null> {
    const db = getDb();
    const rows = await db
      .update(basketItems)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(basketItems.id, itemId))
      .returning();

    return (rows[0] as unknown as BasketItemRecord) || null;
  }

  async removeItem(itemId: string): Promise<void> {
    const db = getDb();
    await db.delete(basketItems).where(eq(basketItems.id, itemId));
  }

  async clearBasket(basketId: string): Promise<void> {
    const db = getDb();
    await db.delete(basketItems).where(eq(basketItems.id, basketId));
  }

  async removeSelectedItems(basketId: string): Promise<void> {
    const db = getDb();
    await db
      .delete(basketItems)
      .where(and(eq(basketItems.basketId, basketId), eq(basketItems.selected, true)));
  }
}

export const basketRepo = new BasketRepository();

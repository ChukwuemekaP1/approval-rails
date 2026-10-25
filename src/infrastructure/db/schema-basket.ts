import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  bigint,
  integer,
  timestamp,
  uniqueIndex,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';
import { workspaces, principals } from './schema';

export const baskets = pgTable(
  'baskets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    principalId: uuid('principal_id')
      .notNull()
      .references(() => principals.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('baskets_ws_principal_idx').on(table.workspaceId, table.principalId),
  ]
);

export const basketItems = pgTable(
  'basket_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    basketId: uuid('basket_id')
      .notNull()
      .references(() => baskets.id, { onDelete: 'cascade' }),
    productId: varchar('product_id', { length: 255 }).notNull(),
    offerId: varchar('offer_id', { length: 255 }).notNull(),
    providerId: varchar('provider_id', { length: 32 }).default('channel3').notNull(),
    title: text('title').notNull(),
    brand: varchar('brand', { length: 255 }),
    category: varchar('category', { length: 100 }),
    description: text('description'),
    merchant: varchar('merchant', { length: 255 }).notNull(),
    sourceUrl: text('source_url').notNull(),
    imageUrl: text('image_url'),
    unitPriceMinor: bigint('unit_price_minor', { mode: 'bigint' }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    quantity: integer('quantity').default(1).notNull(),
    selected: boolean('selected').default(true).notNull(),
    availabilityStatus: varchar('availability_status', { length: 32 }).default('IN_STOCK').notNull(),
    rawMetadata: jsonb('raw_metadata'),
    observedAt: timestamp('observed_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('basket_items_basket_idx').on(t.basketId)]
);

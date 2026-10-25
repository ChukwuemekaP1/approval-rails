import { relations } from 'drizzle-orm';
import { workspaces, principals } from './schema';
import { baskets, basketItems } from './schema-basket';

export const basketsRelations = relations(baskets, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [baskets.workspaceId],
    references: [workspaces.id],
  }),
  principal: one(principals, {
    fields: [baskets.principalId],
    references: [principals.id],
  }),
  items: many(basketItems),
}));

export const basketItemsRelations = relations(basketItems, ({ one }) => ({
  basket: one(baskets, {
    fields: [basketItems.basketId],
    references: [baskets.id],
  }),
}));

import { relations } from 'drizzle-orm';
import { workspaces, principals } from './schema';
import { workspaceInvitations, memberSpendingLimits } from './schema-membership';

export const workspaceInvitationsRelations = relations(workspaceInvitations, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceInvitations.workspaceId],
    references: [workspaces.id],
  }),
  inviter: one(principals, {
    fields: [workspaceInvitations.invitedBy],
    references: [principals.id],
  }),
}));

export const memberSpendingLimitsRelations = relations(memberSpendingLimits, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [memberSpendingLimits.workspaceId],
    references: [workspaces.id],
  }),
  principal: one(principals, {
    fields: [memberSpendingLimits.principalId],
    references: [principals.id],
  }),
}));

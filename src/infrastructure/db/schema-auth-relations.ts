import { relations } from 'drizzle-orm';
import { principals, passkeys, workspaces, workspaceMembers, sessions } from './schema-auth-tables';
import { policies } from './schema-policy-tables';

export const principalsRelations = relations(principals, ({ many }) => ({
  passkeys: many(passkeys),
  workspaceMemberships: many(workspaceMembers),
  createdWorkspaces: many(workspaces),
  sessions: many(sessions),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  creator: one(principals, {
    fields: [workspaces.createdBy],
    references: [principals.id],
  }),
  members: many(workspaceMembers),
  policies: many(policies),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  principal: one(principals, {
    fields: [workspaceMembers.principalId],
    references: [principals.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  principal: one(principals, {
    fields: [sessions.principalId],
    references: [principals.id],
  }),
  activeWorkspace: one(workspaces, {
    fields: [sessions.activeWorkspaceId],
    references: [workspaces.id],
  }),
}));

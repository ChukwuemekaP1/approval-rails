import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sessionRepo } from '../repositories/session-repository';
import { principalRepo } from '../repositories/principal-repository';
import { workspaceRepo } from '../repositories/workspace-repository';
import { SessionContext } from '@/domain/identity/types';

export const SESSION_COOKIE_NAME = 'approve_rail_session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function setSessionCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  const isProduction = process.env.NODE_ENV === 'production';
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function getSessionTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value && cookie.value.length > 0) {
    return cookie.value;
  }

  // Also support Authorization: Bearer <sessionToken> for programmatic API clients / testing
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

export async function resolveSession(token: string): Promise<SessionContext | null> {
  const session = await sessionRepo.findByToken(token);
  if (!session) {
    return null;
  }

  const principal = await principalRepo.findById(session.principalId);
  if (!principal) {
    return null;
  }

  const memberships = await workspaceRepo.listForPrincipal(principal.id);

  let activeWorkspace = null;
  if (session.activeWorkspaceId) {
    activeWorkspace = await workspaceRepo.findById(session.activeWorkspaceId);
  }

  // If no active workspace or session points to one the user is no longer member of, default to first authorized workspace
  if (!activeWorkspace && memberships.length > 0) {
    activeWorkspace = memberships[0].workspace;
    // Persist default active workspace for convenience
    await sessionRepo.updateActiveWorkspace(session.id, activeWorkspace.id);
  }

  return {
    principal,
    session,
    activeWorkspace,
    memberships,
  };
}

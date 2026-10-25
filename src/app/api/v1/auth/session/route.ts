import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionTokenFromRequest,
  resolveSession,
} from '@/infrastructure/auth/session-cookie';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  const token = getSessionTokenFromRequest(request);

  if (!token) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId,
        },
      }
    );
  }

  const sessionContext = await resolveSession(token);
  if (!sessionContext) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId,
        },
      }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      principal: {
        id: sessionContext.principal.id,
        email: sessionContext.principal.email,
        displayName: sessionContext.principal.displayName,
      },
      activeWorkspace: sessionContext.activeWorkspace
        ? {
            id: sessionContext.activeWorkspace.id,
            name: sessionContext.activeWorkspace.name,
            type: sessionContext.activeWorkspace.type,
          }
        : null,
      memberships: sessionContext.memberships.map((m) => ({
        workspace: {
          id: m.workspace.id,
          name: m.workspace.name,
          type: m.workspace.type,
        },
        role: m.role,
      })),
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId,
      },
    }
  );
}

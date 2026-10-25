import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionTokenFromRequest,
  resolveSession,
} from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const { workspaceId } = await params;
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    // Verify caller is a member of this workspace
    await authorizationService.authorizeWorkspace(
      sessionContext.principal.id,
      workspaceId
    );

    const members = await workspaceRepo.listMembers(workspaceId);

    return NextResponse.json(
      {
        workspaceId,
        members: members.map((m) => ({
          id: m.member.id,
          role: m.member.role,
          principalId: m.principal.id,
          email: m.principal.email,
          displayName: m.principal.displayName,
          joinedAt: m.member.createdAt,
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
  } catch (error) {
    return toProblemDetailsResponse(error, {
      instance: '/api/v1/workspaces/members',
      correlationId,
    });
  }
}

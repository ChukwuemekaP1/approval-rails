import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getSessionTokenFromRequest,
  resolveSession,
} from '@/infrastructure/auth/session-cookie';
import { sessionRepo } from '@/infrastructure/repositories/session-repository';
import { authorizationService } from '@/application/auth/authorization-service';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

const selectWorkspaceSchema = z.object({
  workspaceId: z.string().uuid(),
});

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const body = await request.json();
    const parsed = selectWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid workspace selection parameters');
    }

    const { workspaceId } = parsed.data;

    // Verifies workspace membership server-side
    const authContext = await authorizationService.authorizeWorkspace(
      sessionContext.principal.id,
      workspaceId
    );

    // Update session active workspace
    await sessionRepo.updateActiveWorkspace(sessionContext.session.id, workspaceId);

    return NextResponse.json(
      {
        success: true,
        activeWorkspace: {
          id: authContext.workspace.id,
          name: authContext.workspace.name,
          type: authContext.workspace.type,
          role: authContext.role,
        },
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
      instance: '/api/v1/workspaces/select',
      correlationId,
    });
  }
}

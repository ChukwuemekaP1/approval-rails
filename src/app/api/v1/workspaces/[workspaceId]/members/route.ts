import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { memberLimitsRepo } from '@/infrastructure/repositories/member-limits-repository';
import { invitationRepo } from '@/infrastructure/repositories/invitation-repository';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    await authorizationService.authorizeWorkspace(sessionContext.principal.id, workspaceId);

    const rawMembers = await workspaceRepo.listMembers(workspaceId);
    const pendingInvites = await invitationRepo.listPending(workspaceId);

    const membersWithLimits = await Promise.all(
      rawMembers.map(async ({ member, principal }) => {
        const limits = await memberLimitsRepo.find(workspaceId, principal.id);
        return {
          id: member.id,
          principalId: principal.id,
          displayName: principal.displayName,
          email: principal.email,
          role: member.role,
          monthlyBudgetMinor: limits?.monthlyBudgetMinor ? String(limits.monthlyBudgetMinor) : null,
          maxTransactionMinor: limits?.maxTransactionMinor ? String(limits.maxTransactionMinor) : null,
          createdAt: member.createdAt,
        };
      })
    );

    return NextResponse.json(
      { members: membersWithLimits, invitations: pendingInvites },
      { headers: { 'X-Correlation-Id': correlationId } }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

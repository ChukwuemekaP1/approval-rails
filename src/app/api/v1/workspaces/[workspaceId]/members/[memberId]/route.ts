import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { memberLimitsRepo } from '@/infrastructure/repositories/member-limits-repository';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { WorkspaceRole } from '@/domain/identity/types';

export const dynamic = 'force-dynamic';

const updateMemberSchema = z.object({
  role: z.enum(['OWNER', 'MANAGER', 'PURCHASER', 'ADMIN', 'MEMBER']).optional(),
  monthlyBudgetMinor: z.string().nullable().optional(),
  maxTransactionMinor: z.string().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ workspaceId: string; memberId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId, memberId } = await context.params;
    await authorizationService.authorizeWorkspace(session.principal.id, workspaceId, 'OWNER');

    const body = await request.json().catch(() => ({}));
    const parsed = updateMemberSchema.parse(body);

    if (parsed.role) {
      await workspaceRepo.updateMemberRole(workspaceId, memberId, parsed.role as WorkspaceRole);
    }

    if (parsed.monthlyBudgetMinor !== undefined || parsed.maxTransactionMinor !== undefined) {
      await memberLimitsRepo.upsert({
        workspaceId,
        principalId: memberId,
        monthlyBudgetMinor: parsed.monthlyBudgetMinor ? BigInt(parsed.monthlyBudgetMinor) : null,
        maxTransactionMinor: parsed.maxTransactionMinor ? BigInt(parsed.maxTransactionMinor) : null,
      });
    }

    return NextResponse.json({ success: true }, { headers: { 'X-Correlation-Id': correlationId } });
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId, memberId } = await context.params;
    await authorizationService.authorizeWorkspace(session.principal.id, workspaceId, 'OWNER');

    if (session.principal.id === memberId) {
      throw ApiError.badRequest('You cannot remove yourself from the workspace.');
    }

    await workspaceRepo.removeMember(workspaceId, memberId);
    return NextResponse.json({ success: true }, { headers: { 'X-Correlation-Id': correlationId } });
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

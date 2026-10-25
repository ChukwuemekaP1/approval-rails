import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { approvalRepo } from '@/infrastructure/repositories/approval-repository';
import { formatProposalToDTO } from '@/application/proposal/proposal-dto';
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
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    await authorizationService.authorizeWorkspace(session.principal.id, workspaceId, 'MANAGER');

    const allProposals = await proposalRepo.listForWorkspace(workspaceId);
    const pending = allProposals.filter(
      (p) => p.status === 'AWAITING_APPROVAL' || p.status === 'SUBMITTED_FOR_APPROVAL'
    );
    const history = await approvalRepo.listForWorkspace(workspaceId);

    return NextResponse.json(
      {
        pending: pending.map(formatProposalToDTO),
        history,
      },
      { headers: { 'X-Correlation-Id': correlationId } }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

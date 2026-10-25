import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { approvalUseCases } from '@/application/approval/approval-use-cases';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ workspaceId: string; proposalId: string }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId, proposalId } = await context.params;

    const approval = await approvalUseCases.approveProposal(
      workspaceId,
      proposalId,
      session.principal.id
    );

    return NextResponse.json({ success: true, approval }, { headers: { 'X-Correlation-Id': correlationId } });
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

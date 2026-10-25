import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { proposalUseCases } from '@/application/proposal/proposal-use-cases';
import { formatProposalToDTO } from '@/application/proposal/proposal-dto';
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

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const { workspaceId, proposalId } = await context.params;
    if (!workspaceId || !proposalId) {
      throw ApiError.badRequest('Missing workspace ID or proposal ID');
    }

    const sealed = await proposalUseCases.sealProposal(
      proposalId,
      workspaceId,
      sessionContext.principal.id
    );

    return NextResponse.json(
      { proposal: formatProposalToDTO(sealed) },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

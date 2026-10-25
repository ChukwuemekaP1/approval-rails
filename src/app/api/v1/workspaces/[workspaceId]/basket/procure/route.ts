import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { procureFromBasket } from '@/application/procurement/procure-from-basket';
import { formatProposalToDTO } from '@/application/proposal/proposal-dto';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;

    const result = await procureFromBasket(workspaceId, session.principal.id);

    return NextResponse.json(
      {
        success: true,
        proposal: formatProposalToDTO(result.proposal),
        purchaseRequestId: result.purchaseRequest.id,
      },
      { status: 201, headers: { 'X-Correlation-Id': correlationId } }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

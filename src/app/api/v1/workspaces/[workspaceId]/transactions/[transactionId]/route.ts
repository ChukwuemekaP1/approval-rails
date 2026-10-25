import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { orderRepository } from '@/infrastructure/repositories/order-repository';
import { proposalRepo } from '@/infrastructure/repositories/proposal-repository';
import { ledgerRepo } from '@/infrastructure/repositories/ledger-repository';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { formatOrderToDTO } from '@/application/payment/order-dto';
import { formatProposalToDTO } from '@/application/proposal/proposal-dto';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ workspaceId: string; transactionId: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const { workspaceId, transactionId } = await context.params;
    await authorizationService.authorizeWorkspace(sessionContext.principal.id, workspaceId);

    const order = await orderRepository.findById(transactionId);
    if (!order || order.workspaceId !== workspaceId) {
      throw ApiError.notFound('Transaction not found in this workspace');
    }

    const proposal = await proposalRepo.getById(order.proposalId, workspaceId);
    const events = await ledgerRepo.listByStream(order.id);

    return NextResponse.json(
      {
        transaction: formatOrderToDTO(order),
        proposal: proposal ? formatProposalToDTO(proposal) : null,
        events,
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

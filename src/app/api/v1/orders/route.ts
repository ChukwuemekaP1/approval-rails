import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { createOrderUseCase } from '@/application/payment/create-order-use-case';
import { orderRepository } from '@/infrastructure/repositories/order-repository';
import { formatOrderToDTO } from '@/application/payment/order-dto';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { authorizationService } from '@/application/auth/authorization-service';

export const dynamic = 'force-dynamic';

const createOrderSchema = z.object({
  workspaceId: z.string().uuid(),
  proposalId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const body = await request.json().catch(() => ({}));
    const validated = createOrderSchema.parse(body);

    const order = await createOrderUseCase.execute({
      principalId: sessionContext.principal.id,
      workspaceId: validated.workspaceId,
      proposalId: validated.proposalId,
    });

    return NextResponse.json(
      { order: formatOrderToDTO(order) },
      {
        status: 201,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

export async function GET(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) throw ApiError.badRequest('Missing workspaceId query parameter');

    await authorizationService.authorizeWorkspace(sessionContext.principal.id, workspaceId);

    const orders = await orderRepository.listByWorkspace(workspaceId);

    return NextResponse.json(
      { orders: orders.map(formatOrderToDTO) },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

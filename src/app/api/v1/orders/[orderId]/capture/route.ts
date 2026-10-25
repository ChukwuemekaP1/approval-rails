import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { orderRepository } from '@/infrastructure/repositories/order-repository';
import { captureOrderUseCase } from '@/application/payment/capture-order-use-case';
import { formatOrderToDTO } from '@/application/payment/order-dto';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const { orderId } = await context.params;
    const existing = await orderRepository.findById(orderId);
    if (!existing) throw ApiError.notFound(`Order ${orderId} not found`);

    const order = await captureOrderUseCase.execute({
      principalId: sessionContext.principal.id,
      workspaceId: existing.workspaceId,
      orderId,
    });

    return NextResponse.json(
      { order: formatOrderToDTO(order) },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

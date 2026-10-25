import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { orderRepository } from '@/infrastructure/repositories/order-repository';
import { formatOrderToDTO } from '@/application/payment/order-dto';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { authorizationService } from '@/application/auth/authorization-service';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const { orderId } = await context.params;
    const order = await orderRepository.findById(orderId);
    if (!order) throw ApiError.notFound(`Order ${orderId} not found`);

    await authorizationService.authorizeWorkspace(
      sessionContext.principal.id,
      order.workspaceId
    );

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

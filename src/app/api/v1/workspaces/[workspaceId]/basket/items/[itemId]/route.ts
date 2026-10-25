import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { basketRepo } from '@/infrastructure/repositories/basket-repository';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ workspaceId: string; itemId: string }>;
}

const updateItemSchema = z.object({
  quantity: z.number().int().positive().optional(),
  selected: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId, itemId } = await context.params;
    await authorizationService.authorizeWorkspace(session.principal.id, workspaceId);

    const body = await request.json().catch(() => ({}));
    const parsed = updateItemSchema.parse(body);

    const updated = await basketRepo.updateItem(itemId, parsed);
    if (!updated) throw ApiError.notFound('Basket item not found');

    return NextResponse.json(
      { success: true, item: { ...updated, unitPriceMinor: String(updated.unitPriceMinor) } },
      { headers: { 'X-Correlation-Id': correlationId } }
    );
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

    const { workspaceId, itemId } = await context.params;
    await authorizationService.authorizeWorkspace(session.principal.id, workspaceId);

    await basketRepo.removeItem(itemId);
    return NextResponse.json({ success: true }, { headers: { 'X-Correlation-Id': correlationId } });
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

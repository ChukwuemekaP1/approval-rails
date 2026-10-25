import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { basketRepo } from '@/infrastructure/repositories/basket-repository';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { CurrencyCode, formatMinorUnitsToDecimal } from '@/domain/money/currency';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

const addItemSchema = z.object({
  productId: z.string().min(1),
  offerId: z.string().min(1),
  providerId: z.string().default('channel3'),
  title: z.string().min(1),
  brand: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  merchant: z.string().min(1),
  sourceUrl: z.string().url(),
  imageUrl: z.string().nullable().optional(),
  unitPriceMinor: z.string(),
  currency: z.string().default('USD'),
  quantity: z.number().int().positive().default(1),
});

export async function GET(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    await authorizationService.authorizeWorkspace(session.principal.id, workspaceId);

    const basketId = await basketRepo.getOrCreateBasket(workspaceId, session.principal.id);
    const items = await basketRepo.listItems(basketId);

    let selectedSubtotalMinor = 0n;
    let totalBasketMinor = 0n;
    let selectedCount = 0;

    const formattedItems = items.map((item) => {
      const lineTotal = item.unitPriceMinor * BigInt(item.quantity);
      totalBasketMinor += lineTotal;
      if (item.selected) {
        selectedSubtotalMinor += lineTotal;
        selectedCount += item.quantity;
      }
      return {
        ...item,
        unitPriceMinor: String(item.unitPriceMinor),
        lineTotalMinor: String(lineTotal),
        formattedUnitPrice: `$${formatMinorUnitsToDecimal(item.unitPriceMinor, item.currency as CurrencyCode)}`,
        formattedLineTotal: `$${formatMinorUnitsToDecimal(lineTotal, item.currency as CurrencyCode)}`,
      };
    });

    return NextResponse.json(
      {
        basketId,
        items: formattedItems,
        totalItemsCount: items.length,
        selectedCount,
        selectedSubtotalMinor: String(selectedSubtotalMinor),
        totalBasketMinor: String(totalBasketMinor),
        formattedSelectedSubtotal: `$${formatMinorUnitsToDecimal(selectedSubtotalMinor, 'USD')}`,
        formattedTotalBasket: `$${formatMinorUnitsToDecimal(totalBasketMinor, 'USD')}`,
      },
      { headers: { 'X-Correlation-Id': correlationId } }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    await authorizationService.authorizeWorkspace(session.principal.id, workspaceId);

    const body = await request.json().catch(() => ({}));
    const parsed = addItemSchema.parse(body);

    const basketId = await basketRepo.getOrCreateBasket(workspaceId, session.principal.id);
    const item = await basketRepo.addItem(basketId, {
      ...parsed,
      brand: parsed.brand || null,
      category: parsed.category || null,
      description: parsed.description || null,
      imageUrl: parsed.imageUrl || null,
      unitPriceMinor: BigInt(parsed.unitPriceMinor),
      selected: true,
      availabilityStatus: 'IN_STOCK',
      observedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, item: { ...item, unitPriceMinor: String(item.unitPriceMinor) } },
      { status: 201, headers: { 'X-Correlation-Id': correlationId } }
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

    const { workspaceId } = await context.params;
    await authorizationService.authorizeWorkspace(session.principal.id, workspaceId);

    const basketId = await basketRepo.getOrCreateBasket(workspaceId, session.principal.id);
    await basketRepo.clearBasket(basketId);

    return NextResponse.json({ success: true }, { headers: { 'X-Correlation-Id': correlationId } });
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

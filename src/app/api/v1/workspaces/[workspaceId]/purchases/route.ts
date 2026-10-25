import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { purchaseUseCases } from '@/application/purchase/purchase-use-cases';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { CurrencyCode, parseDecimalToMinorUnits } from '@/domain/money/currency';

export const dynamic = 'force-dynamic';

const createPurchaseSchema = z.object({
  intent: z.string().min(2).max(1000),
  budget: z.string().optional().nullable(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'] as [CurrencyCode, ...CurrencyCode[]]).default('USD'),
  category: z.string().max(100).optional().nullable(),
  preferredMerchant: z.string().max(100).optional().nullable(),
  autoResearch: z.boolean().default(true),
});

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    if (!workspaceId) throw ApiError.badRequest('Missing workspace ID');

    const requests = await purchaseUseCases.listRequests(sessionContext.principal.id, workspaceId);

    return NextResponse.json(
      { requests },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
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

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    if (!workspaceId) throw ApiError.badRequest('Missing workspace ID');

    const body = await request.json();
    const parsed = createPurchaseSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid purchase request parameters', {
        validation: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    let budgetMinor: bigint | null = null;
    if (parsed.data.budget && parsed.data.budget.trim().length > 0) {
      try {
        budgetMinor = parseDecimalToMinorUnits(parsed.data.budget, parsed.data.currency);
      } catch (err: any) {
        throw ApiError.badRequest(err.message || 'Invalid budget decimal format');
      }
    }

    const created = await purchaseUseCases.createRequest(
      sessionContext.principal.id,
      workspaceId,
      {
        intent: parsed.data.intent,
        budgetMinor,
        currency: parsed.data.currency,
        category: parsed.data.category,
        preferredMerchant: parsed.data.preferredMerchant,
      },
      correlationId
    );

    // If autoResearch requested, trigger research in the flow
    let finalResult = created;
    if (parsed.data.autoResearch) {
      finalResult = await purchaseUseCases.executeResearch(
        sessionContext.principal.id,
        workspaceId,
        created.id
      );
    }

    return NextResponse.json(
      { request: finalResult },
      {
        status: 201,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

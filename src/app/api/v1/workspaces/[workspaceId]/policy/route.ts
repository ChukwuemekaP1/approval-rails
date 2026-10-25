import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getSessionTokenFromRequest,
  resolveSession,
} from '@/infrastructure/auth/session-cookie';
import { policyUseCases } from '@/application/policy/policy-use-cases';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { parseDecimalToMinorUnits, CurrencyCode, SUPPORTED_CURRENCIES } from '@/domain/money/currency';

export const dynamic = 'force-dynamic';

const createPolicySchema = z.object({
  name: z.string().min(1).max(100).default('Spending Policy'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'] as [CurrencyCode, ...CurrencyCode[]]),
  maxTransactionAmount: z.string().min(1), // Decimal string (e.g. "250.00")
  monthlyBudgetCap: z.string().min(1), // Decimal string (e.g. "1000.00")
  requireAdminAbove: z.string().optional().nullable(), // Optional decimal string
  allowedCategories: z.array(z.string().min(1)).optional().nullable(),
  blockedMerchants: z.array(z.string().min(1)).optional().nullable(),
});

interface RouteParams {
  params: Promise<{
    workspaceId: string;
  }>;
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

    const policy = await policyUseCases.getActivePolicy(
      sessionContext.principal.id,
      workspaceId
    );

    return NextResponse.json(
      { policy },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId,
        },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, {
      instance: request.nextUrl.pathname,
      correlationId,
    });
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
    const parsed = createPolicySchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid policy parameters', {
        validation: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const {
      name,
      currency,
      maxTransactionAmount,
      monthlyBudgetCap,
      requireAdminAbove,
      allowedCategories,
      blockedMerchants,
    } = parsed.data;

    let maxTxMinor: bigint;
    let monthlyCapMinor: bigint;
    let requireAdminAboveMinor: bigint | null = null;

    try {
      maxTxMinor = parseDecimalToMinorUnits(maxTransactionAmount, currency);
      monthlyCapMinor = parseDecimalToMinorUnits(monthlyBudgetCap, currency);
      if (requireAdminAbove && requireAdminAbove.trim().length > 0) {
        requireAdminAboveMinor = parseDecimalToMinorUnits(requireAdminAbove, currency);
      }
    } catch (parseErr) {
      throw ApiError.badRequest(
        parseErr instanceof Error ? parseErr.message : 'Invalid monetary amount formatting'
      );
    }

    const created = await policyUseCases.createAndActivateVersion(
      sessionContext.principal.id,
      workspaceId,
      {
        name,
        currency,
        maxTransactionAmount: maxTxMinor,
        monthlyBudgetCap: monthlyCapMinor,
        requireAdminAbove: requireAdminAboveMinor,
        allowedCategories: allowedCategories || null,
        blockedMerchants: blockedMerchants || null,
      }
    );

    return NextResponse.json(
      { policy: created },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId,
        },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, {
      instance: request.nextUrl.pathname,
      correlationId,
    });
  }
}

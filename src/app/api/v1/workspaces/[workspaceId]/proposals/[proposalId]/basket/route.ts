import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { proposalUseCases } from '@/application/proposal/proposal-use-cases';
import { formatProposalToDTO } from '@/application/proposal/proposal-dto';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

const reviseBasketSchema = z.object({
  items: z
    .array(
      z.object({
        candidateId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

interface RouteParams {
  params: Promise<{ workspaceId: string; proposalId: string }>;
}

export async function PUT(request: NextRequest, context: RouteParams) {
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

    const body = await request.json();
    const parsed = reviseBasketSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid basket items', {
        validation: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const updated = await proposalUseCases.reviseBasket(
      proposalId,
      workspaceId,
      sessionContext.principal.id,
      parsed.data.items
    );

    return NextResponse.json(
      { proposal: formatProposalToDTO(updated) },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

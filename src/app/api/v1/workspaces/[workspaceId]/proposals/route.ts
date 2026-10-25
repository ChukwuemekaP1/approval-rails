import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { proposalUseCases } from '@/application/proposal/proposal-use-cases';
import { formatProposalToDTO } from '@/application/proposal/proposal-dto';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

const createProposalSchema = z.object({
  sourceRequestId: z.string().uuid(),
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

    const proposals = await proposalUseCases.listWorkspaceProposals(
      workspaceId,
      sessionContext.principal.id
    );

    return NextResponse.json(
      { proposals: proposals.map(formatProposalToDTO) },
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
    const parsed = createProposalSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid proposal parameters', {
        validation: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const created = await proposalUseCases.createProposal({
      workspaceId,
      requesterId: sessionContext.principal.id,
      sourceRequestId: parsed.data.sourceRequestId,
      items: parsed.data.items,
    });

    return NextResponse.json(
      { proposal: formatProposalToDTO(created) },
      {
        status: 201,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

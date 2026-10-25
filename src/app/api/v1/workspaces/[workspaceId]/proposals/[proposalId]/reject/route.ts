import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { approvalUseCases } from '@/application/approval/approval-use-cases';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

const rejectSchema = z.object({
  reason: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ workspaceId: string; proposalId: string }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId, proposalId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { reason } = rejectSchema.parse(body);

    const rejection = await approvalUseCases.rejectProposal(
      workspaceId,
      proposalId,
      session.principal.id,
      reason
    );

    return NextResponse.json({ success: true, rejection }, { headers: { 'X-Correlation-Id': correlationId } });
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

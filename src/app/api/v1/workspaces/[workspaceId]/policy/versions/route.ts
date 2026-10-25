import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionTokenFromRequest,
  resolveSession,
} from '@/infrastructure/auth/session-cookie';
import { policyUseCases } from '@/application/policy/policy-use-cases';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

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

    const versions = await policyUseCases.listVersions(
      sessionContext.principal.id,
      workspaceId
    );

    return NextResponse.json(
      { versions },
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

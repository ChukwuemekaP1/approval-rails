import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { invitationRepo } from '@/infrastructure/repositories/invitation-repository';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { getEnv } from '@/infrastructure/config/env';

export const dynamic = 'force-dynamic';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'MANAGER', 'PURCHASER', 'ADMIN', 'MEMBER']).default('PURCHASER'),
});

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    await authorizationService.authorizeWorkspace(sessionContext.principal.id, workspaceId, 'OWNER');

    const body = await request.json().catch(() => ({}));
    const parsed = inviteSchema.parse(body);

    const invitation = await invitationRepo.create({
      workspaceId,
      email: parsed.email,
      role: parsed.role,
      invitedBy: sessionContext.principal.id,
    });

    const env = getEnv();
    const inviteUrl = `${env.APP_URL}/invitations/${invitation.token}`;

    return NextResponse.json(
      { invitation, inviteUrl },
      { status: 201, headers: { 'X-Correlation-Id': correlationId } }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

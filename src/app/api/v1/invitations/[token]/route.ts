import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { invitationRepo } from '@/infrastructure/repositories/invitation-repository';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const { token } = await context.params;
    const details = await invitationRepo.findByToken(token);
    if (!details) {
      throw ApiError.notFound('Invitation not found or invalid token');
    }

    const isExpired = new Date() > details.invitation.expiresAt;
    const isAccepted = Boolean(details.invitation.acceptedAt);

    return NextResponse.json(
      {
        workspace: details.workspace,
        inviter: details.inviter,
        email: details.invitation.email,
        role: details.invitation.role,
        isExpired,
        isAccepted,
        expiresAt: details.invitation.expiresAt,
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
    const sessionToken = getSessionTokenFromRequest(request);
    if (!sessionToken) {
      throw ApiError.unauthorized('Please sign in or create an account to accept this invitation');
    }
    const session = await resolveSession(sessionToken);
    if (!session) {
      throw ApiError.unauthorized('Invalid or expired session');
    }

    const { token } = await context.params;
    const details = await invitationRepo.findByToken(token);
    if (!details) throw ApiError.notFound('Invitation not found');
    if (new Date() > details.invitation.expiresAt) throw ApiError.badRequest('This invitation has expired');
    if (details.invitation.acceptedAt) throw ApiError.badRequest('This invitation has already been accepted');

    const existingMember = await workspaceRepo.getMember(
      details.workspace.id,
      session.principal.id
    );

    if (!existingMember) {
      await workspaceRepo.addMember(
        details.workspace.id,
        session.principal.id,
        details.invitation.role
      );
    }

    await invitationRepo.markAccepted(details.invitation.id);

    return NextResponse.json(
      { success: true, workspaceId: details.workspace.id },
      { headers: { 'X-Correlation-Id': correlationId } }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

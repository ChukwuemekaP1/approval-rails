import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { authorizationService } from '@/application/auth/authorization-service';
import { notificationOutboxRepository } from '@/infrastructure/repositories/notification-outbox-repository';
import { maskWebhookUrl } from '@/domain/notification/sanitizer';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

const updateSettingsSchema = z.object({
  zapierWebhookUrl: z.string().url().max(1024).nullable().optional(),
  enabled: z.boolean().optional(),
  notifyProposalReady: z.boolean().optional(),
  notifyPolicyDenied: z.boolean().optional(),
  notifyPaymentCompleted: z.boolean().optional(),
  notifyPaymentFailed: z.boolean().optional(),
  notifyReconciliation: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    await authorizationService.authorizeWorkspace(session.principal.id, workspaceId);

    const settings = await notificationOutboxRepository.getSettings(workspaceId);

    return NextResponse.json(
      {
        settings: settings
          ? {
              ...settings,
              maskedWebhookUrl: maskWebhookUrl(settings.zapierWebhookUrl),
              hasWebhookUrl: Boolean(settings.zapierWebhookUrl),
              zapierWebhookUrl: undefined, // Never leak full secret URL in GET
            }
          : null,
      },
      { headers: { 'x-correlation-id': correlationId } }
    );
  } catch (err) {
    return toProblemDetailsResponse(err, { correlationId });
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();
    const session = await resolveSession(token);
    if (!session) throw ApiError.unauthorized();

    const { workspaceId } = await context.params;
    const membership = await authorizationService.authorizeWorkspace(
      session.principal.id,
      workspaceId
    );
    if (membership.role !== 'ADMIN') {
      throw ApiError.forbidden('Only workspace admins can configure webhook settings');
    }

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid settings payload');
    }

    const updated = await notificationOutboxRepository.upsertSettings({
      workspaceId,
      ...parsed.data,
    });

    return NextResponse.json(
      {
        settings: {
          ...updated,
          maskedWebhookUrl: maskWebhookUrl(updated.zapierWebhookUrl),
          hasWebhookUrl: Boolean(updated.zapierWebhookUrl),
          zapierWebhookUrl: undefined,
        },
      },
      { headers: { 'x-correlation-id': correlationId } }
    );
  } catch (err) {
    return toProblemDetailsResponse(err, { correlationId });
  }
}

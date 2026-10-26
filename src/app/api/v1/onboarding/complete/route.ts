import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTokenFromRequest, resolveSession } from '@/infrastructure/auth/session-cookie';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { sessionRepo } from '@/infrastructure/repositories/session-repository';
import { invitationRepo } from '@/infrastructure/repositories/invitation-repository';
import { policyUseCases } from '@/application/policy/policy-use-cases';
import { parseDecimalToMinorUnits, CurrencyCode } from '@/domain/money/currency';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

const onboardingSchema = z.object({
  workspaceType: z.enum(['PERSONAL', 'BUSINESS']),
  workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters'),
  currency: z.enum(['USD', 'EUR', 'GBP'] as [CurrencyCode, ...CurrencyCode[]]),
  maxTransactionAmount: z.string().min(1, 'Transaction limit is required'),
  monthlyBudgetCap: z.string().min(1, 'Monthly budget is required'),
  requireAdminAbove: z.string().optional().nullable(),
  managerEmail: z.string().email('Invalid manager email').optional().nullable(),
  industry: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized('Authentication required to complete onboarding');

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized('Session expired. Please log in.');

    const body = await request.json().catch(() => ({}));
    const parsed = onboardingSchema.parse(body);

    const principalId = sessionContext.principal.id;
    let workspace = sessionContext.activeWorkspace;

    if (!workspace) {
      workspace = await workspaceRepo.create({
        name: parsed.workspaceName.trim(),
        type: parsed.workspaceType,
        createdBy: principalId,
      });
      await sessionRepo.updateActiveWorkspace(sessionContext.session.id, workspace.id);
    } else {
      await workspaceRepo.update(workspace.id, {
        name: parsed.workspaceName.trim(),
        type: parsed.workspaceType,
      });
    }

    const maxTxMinor = parseDecimalToMinorUnits(parsed.maxTransactionAmount, parsed.currency);
    const monthlyMinor = parseDecimalToMinorUnits(parsed.monthlyBudgetCap, parsed.currency);
    let requireAdminMinor: bigint | null = null;
    if (parsed.requireAdminAbove?.trim()) {
      requireAdminMinor = parseDecimalToMinorUnits(parsed.requireAdminAbove, parsed.currency);
    }

    await policyUseCases.createAndActivateVersion(principalId, workspace.id, {
      name: `${parsed.workspaceName} Authoritative Policy`,
      currency: parsed.currency,
      maxTransactionAmount: maxTxMinor,
      monthlyBudgetCap: monthlyMinor,
      requireAdminAbove: requireAdminMinor,
      allowedCategories: null,
      blockedMerchants: null,
    });

    if (parsed.workspaceType === 'BUSINESS' && parsed.managerEmail?.trim()) {
      await invitationRepo.create({
        workspaceId: workspace.id,
        email: parsed.managerEmail.trim(),
        role: 'MANAGER',
        invitedBy: principalId,
      });
    }

    return NextResponse.json(
      {
        success: true,
        workspaceId: workspace.id,
        redirectTo: '/app',
      },
      { status: 200, headers: { 'X-Correlation-Id': correlationId } }
    );
  } catch (err) {
    return toProblemDetailsResponse(err, { instance: request.nextUrl.pathname, correlationId });
  }
}

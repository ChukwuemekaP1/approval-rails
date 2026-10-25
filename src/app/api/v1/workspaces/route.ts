import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getSessionTokenFromRequest,
  resolveSession,
} from '@/infrastructure/auth/session-cookie';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(['PERSONAL', 'BUSINESS']).default('BUSINESS'),
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const workspaces = await workspaceRepo.listForPrincipal(sessionContext.principal.id);

    return NextResponse.json(
      {
        workspaces: workspaces.map((w) => ({
          id: w.workspace.id,
          name: w.workspace.name,
          type: w.workspace.type,
          role: w.role,
          createdAt: w.workspace.createdAt,
        })),
      },
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
      instance: '/api/v1/workspaces',
      correlationId,
    });
  }
}

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) throw ApiError.unauthorized();

    const sessionContext = await resolveSession(token);
    if (!sessionContext) throw ApiError.unauthorized();

    const body = await request.json();
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid workspace creation parameters', {
        validation: parsed.error.issues.map((i) => i.message),
      });
    }

    const created = await workspaceRepo.create({
      name: parsed.data.name,
      type: parsed.data.type,
      createdBy: sessionContext.principal.id,
    });

    return NextResponse.json(
      {
        workspace: {
          id: created.id,
          name: created.name,
          type: created.type,
          role: 'ADMIN',
          createdAt: created.createdAt,
        },
      },
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
      instance: '/api/v1/workspaces',
      correlationId,
    });
  }
}

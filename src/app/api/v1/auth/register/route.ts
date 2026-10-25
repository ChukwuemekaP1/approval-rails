import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { principalRepo } from '@/infrastructure/repositories/principal-repository';
import { workspaceRepo } from '@/infrastructure/repositories/workspace-repository';
import { sessionRepo } from '@/infrastructure/repositories/session-repository';
import {
  generateSessionToken,
  SESSION_MAX_AGE_SECONDS,
  setSessionCookie,
} from '@/infrastructure/auth/session-cookie';
import { hashPassword } from '@/infrastructure/auth/password';
import { toProblemDetailsResponse, ApiError } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { challengeRateLimiter } from '@/infrastructure/security/rate-limiter';

export const dynamic = 'force-dynamic';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password confirmation is required'),
    workspaceType: z.enum(['PERSONAL', 'BUSINESS']).default('PERSONAL'),
    businessName: z.string().optional(),
    industry: z.string().optional(),
    location: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    challengeRateLimiter.check(`register:${ip}`, 10, 60000);

    const body = await request.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid registration data', {
        errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const { fullName, email, password, workspaceType, businessName } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await principalRepo.findByEmail(normalizedEmail);
    if (existing) {
      throw ApiError.badRequest('An account with this email address already exists. Please log in.');
    }

    const passwordHash = hashPassword(password);
    const principal = await principalRepo.create({
      email: normalizedEmail,
      displayName: fullName.trim(),
      passwordHash,
    });

    const wsName =
      workspaceType === 'BUSINESS' && businessName?.trim()
        ? businessName.trim()
        : `${fullName.trim()}'s Workspace`;

    const activeWorkspace = await workspaceRepo.create({
      name: wsName,
      type: workspaceType,
      createdBy: principal.id,
    });

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

    await sessionRepo.create({
      sessionToken,
      principalId: principal.id,
      activeWorkspaceId: activeWorkspace.id,
      expiresAt,
      userAgent: request.headers.get('user-agent'),
      ipAddress: ip,
    });

    const response = NextResponse.json(
      {
        success: true,
        principal: { id: principal.id, email: principal.email, displayName: principal.displayName },
        activeWorkspace,
        redirectTo: workspaceType === 'BUSINESS' ? '/app/policies' : '/app/shop',
      },
      { status: 201, headers: { 'X-Correlation-Id': correlationId } }
    );

    setSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

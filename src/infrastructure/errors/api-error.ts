import { NextResponse } from 'next/server';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  correlationId?: string;
  errors?: Record<string, string[] | string>;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, string[] | string>;

  constructor(status: number, code: string, message: string, details?: Record<string, string[] | string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: Record<string, string[] | string>) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message: string = 'Authentication required') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message: string = 'Access denied') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string = 'Conflict occurred') {
    return new ApiError(409, 'CONFLICT', message);
  }

  static unprocessableEntity(message: string, details?: Record<string, string[] | string>) {
    return new ApiError(422, 'UNPROCESSABLE_ENTITY', message, details);
  }

  static serviceUnavailable(message: string = 'Service temporarily unavailable', details?: Record<string, string[] | string>) {
    return new ApiError(503, 'SERVICE_UNAVAILABLE', message, details);
  }

  static badGateway(message: string = 'Bad gateway', details?: Record<string, string[] | string>) {
    return new ApiError(502, 'BAD_GATEWAY', message, details);
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}

export function toProblemDetailsResponse(
  error: unknown,
  options: { instance?: string; correlationId?: string } = {}
): NextResponse<ProblemDetails> {
  const { instance, correlationId } = options;

  if (error && typeof error === 'object' && ('issues' in error || (error as any).name === 'ZodError')) {
    const issues = (error as any).issues || [];
    const firstMsg = issues[0]?.message || 'Validation error';
    const field = issues[0]?.path?.join('.') || 'body';
    error = ApiError.badRequest(`${field}: ${firstMsg}`);
  }

  if (error instanceof ApiError) {
    const body: ProblemDetails = {
      type: `https://approve-rail.dev/errors/${error.code.toLowerCase().replace(/_/g, '-')}`,
      title: error.code,
      status: error.status,
      detail: error.message,
      ...(instance ? { instance } : {}),
      ...(correlationId ? { correlationId } : {}),
      ...(error.details ? { errors: error.details } : {}),
    };
    return NextResponse.json(body, {
      status: error.status,
      headers: {
        'Content-Type': 'application/problem+json',
        ...(correlationId ? { 'X-Correlation-Id': correlationId } : {}),
      },
    });
  }

  const detail = error instanceof Error ? error.message : 'An unexpected error occurred';
  const body: ProblemDetails = {
    type: 'https://approve-rail.dev/errors/internal-server-error',
    title: 'INTERNAL_SERVER_ERROR',
    status: 500,
    detail,
    ...(instance ? { instance } : {}),
    ...(correlationId ? { correlationId } : {}),
  };

  return NextResponse.json(body, {
    status: 500,
    headers: {
      'Content-Type': 'application/problem+json',
      ...(correlationId ? { 'X-Correlation-Id': correlationId } : {}),
    },
  });
}

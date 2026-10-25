import { describe, it, expect } from 'vitest';
import { ApiError, toProblemDetailsResponse } from '@/infrastructure/errors/api-error';

describe('RFC 9457 ApiError & Response Formatter', () => {
  it('converts ApiError to RFC 9457 compliant response', async () => {
    const error = ApiError.badRequest('Invalid monetary value', {
      amount: ['Must be an integer in minor units'],
    });

    const response = toProblemDetailsResponse(error, {
      instance: '/api/v1/proposals',
      correlationId: 'req-corr-12345',
    });

    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toBe('application/problem+json');
    expect(response.headers.get('X-Correlation-Id')).toBe('req-corr-12345');

    const body = await response.json();
    expect(body.title).toBe('BAD_REQUEST');
    expect(body.status).toBe(400);
    expect(body.detail).toBe('Invalid monetary value');
    expect(body.instance).toBe('/api/v1/proposals');
    expect(body.correlationId).toBe('req-corr-12345');
    expect(body.errors).toEqual({
      amount: ['Must be an integer in minor units'],
    });
  });

  it('handles standard generic errors as 500 internal server errors', async () => {
    const genericError = new Error('Database connection reset');
    const response = toProblemDetailsResponse(genericError, {
      correlationId: 'req-err-999',
    });

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.status).toBe(500);
    expect(body.title).toBe('INTERNAL_SERVER_ERROR');
    expect(body.detail).toBe('Database connection reset');
    expect(body.correlationId).toBe('req-err-999');
  });
});

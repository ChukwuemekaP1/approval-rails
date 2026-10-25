import { describe, it, expect } from 'vitest';
import { challengeRateLimiter } from '@/infrastructure/security/rate-limiter';
import { ApiError } from '@/infrastructure/errors/api-error';

describe('Challenge Rate Limiter', () => {
  it('allows requests within the configured threshold', () => {
    const key = `test-ip-${Date.now()}`;
    expect(() => {
      for (let i = 0; i < 5; i++) {
        challengeRateLimiter.check(key, 5, 10000);
      }
    }).not.toThrow();
  });

  it('throws 429 Too Many Requests when rate limit is exceeded', () => {
    const key = `test-ip-blocked-${Date.now()}`;
    expect(() => {
      for (let i = 0; i < 3; i++) {
        challengeRateLimiter.check(key, 2, 10000);
      }
    }).toThrowError(/Rate limit exceeded/);

    try {
      challengeRateLimiter.check(key, 2, 10000);
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(429);
      expect(err.code).toBe('TOO_MANY_REQUESTS');
    }
  });
});

import { ApiError } from '../errors/api-error';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter {
  private readonly store = new Map<string, RateLimitRecord>();

  check(key: string, limit: number, windowMs: number): void {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (existing.count >= limit) {
      const waitSec = Math.ceil((existing.resetAt - now) / 1000);
      throw new ApiError(
        429,
        'TOO_MANY_REQUESTS',
        `Rate limit exceeded. Please wait ${waitSec} seconds before retrying.`
      );
    }

    existing.count++;
  }

  // Periodic cleanup
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

export const challengeRateLimiter = new InMemoryRateLimiter();
setInterval(() => challengeRateLimiter.cleanup(), 60000).unref();

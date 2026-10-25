import { describe, it, expect } from 'vitest';
import { validateEnv } from '@/infrastructure/config/env';

describe('Server Environment Validation', () => {
  it('loads valid default values for development environment', () => {
    const env = validateEnv({});
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
    expect(env.APP_URL).toBe('http://localhost:3000');
    expect(env.LOG_LEVEL).toBe('info');
    expect(env.DATABASE_URL).toContain('approve_rail');
  });

  it('correctly parses custom overrides', () => {
    const env = validateEnv({
      NODE_ENV: 'production',
      PORT: '8080',
      APP_URL: 'https://approve-rail.example.com',
      LOG_LEVEL: 'warn',
      DATABASE_URL: 'postgresql://usr:pwd@db.host:5432/custom_db',
      DATABASE_POOL_MIN: '2',
      DATABASE_POOL_MAX: '20',
    });

    expect(env.NODE_ENV).toBe('production');
    expect(env.PORT).toBe(8080);
    expect(env.APP_URL).toBe('https://approve-rail.example.com');
    expect(env.LOG_LEVEL).toBe('warn');
    expect(env.DATABASE_POOL_MIN).toBe(2);
    expect(env.DATABASE_POOL_MAX).toBe(20);
  });

  it('fails with descriptive error when invalid values are provided', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'invalid_env' as any,
        PORT: 'not-a-number',
      })
    ).toThrowError(/Environment validation failed/);
  });
});

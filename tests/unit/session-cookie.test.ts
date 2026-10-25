import { describe, it, expect } from 'vitest';
import {
  generateSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  setSessionCookie,
  clearSessionCookie,
  getSessionTokenFromRequest,
} from '@/infrastructure/auth/session-cookie';
import { NextResponse, NextRequest } from 'next/server';

describe('Session Cookie Security & Attributes', () => {
  it('generates high-entropy 64-character hex cryptographic tokens', () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
    expect(/^[0-9a-f]{64}$/.test(token1)).toBe(true);
  });

  it('sets secure cookie attributes: HttpOnly, SameSite=lax, Max-Age bounded', () => {
    const response = NextResponse.json({ ok: true });
    const token = generateSessionToken();

    setSessionCookie(response, token);

    const cookie = response.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie).toBeDefined();
    expect(cookie?.value).toBe(token);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
    expect(cookie?.maxAge).toBe(SESSION_MAX_AGE_SECONDS);
    expect(cookie?.path).toBe('/');
  });

  it('clears session cookie on logout by setting maxAge=0', () => {
    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);

    const cookie = response.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie).toBeDefined();
    expect(cookie?.value).toBe('');
    expect(cookie?.maxAge).toBe(0);
  });

  it('extracts session token from cookie or Authorization header', () => {
    const reqWithCookie = new NextRequest('http://localhost:3000/api/v1/auth/session', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=test-cookie-token-123`,
      },
    });

    expect(getSessionTokenFromRequest(reqWithCookie)).toBe('test-cookie-token-123');

    const reqWithBearer = new NextRequest('http://localhost:3000/api/v1/auth/session', {
      headers: {
        authorization: 'Bearer test-bearer-token-456',
      },
    });

    expect(getSessionTokenFromRequest(reqWithBearer)).toBe('test-bearer-token-456');
  });
});

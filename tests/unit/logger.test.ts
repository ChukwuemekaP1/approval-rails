import { describe, it, expect } from 'vitest';
import pino from 'pino';

describe('Structured Logger Secret Redaction', () => {
  it('redacts sensitive fields in log payloads', () => {
    let capturedLog = '';
    const destination = {
      write: (msg: string) => {
        capturedLog = msg;
      },
    };

    const logger = pino(
      {
        redact: {
          paths: ['authorization', 'password', 'secret', 'paypal_client_secret', 'headers.authorization'],
          censor: '[REDACTED]',
        },
      },
      destination
    );

    logger.info({
      user: 'alice',
      password: 'super-secret-password-123',
      secret: 'sk_live_xyz987',
      paypal_client_secret: 'paypal-secret-token',
      headers: {
        authorization: 'Bearer jwt-token-content',
      },
    });

    expect(capturedLog).not.toContain('super-secret-password-123');
    expect(capturedLog).not.toContain('sk_live_xyz987');
    expect(capturedLog).not.toContain('paypal-secret-token');
    expect(capturedLog).not.toContain('Bearer jwt-token-content');

    expect(capturedLog).toContain('[REDACTED]');
    expect(capturedLog).toContain('"user":"alice"');
  });
});

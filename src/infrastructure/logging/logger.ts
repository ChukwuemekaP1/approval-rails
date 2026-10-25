import pino from 'pino';

const SENSITIVE_KEYS = [
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'secret',
  'client_secret',
  'paypal_client_secret',
  'private_key',
  'api_key',
  'token',
  'accessToken',
  'refreshToken',
  'passkeyPrivateKey',
  'zapierWebhookUrl',
  'zapier_webhook_url',
  'webhookUrl',
  'webhook_url',
];

const redactPaths = [
  ...SENSITIVE_KEYS,
  ...SENSITIVE_KEYS.map((k) => `*.${k}`),
  ...SENSITIVE_KEYS.map((k) => `*.*.${k}`),
  'headers.authorization',
  'headers.cookie',
  'req.headers.authorization',
  'req.headers.cookie',
];

export const baseLogger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  base: {
    service: 'approve-rail',
    env: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function createChildLogger(bindings: { correlationId?: string; [key: string]: unknown }) {
  return baseLogger.child(bindings);
}

export type Logger = typeof baseLogger;

import crypto from 'crypto';

export function getOrCreateCorrelationId(headers: Headers): string {
  const existing =
    headers.get('x-correlation-id') ||
    headers.get('x-request-id') ||
    headers.get('traceparent');

  if (existing && existing.trim().length > 0) {
    return existing.trim();
  }

  return crypto.randomUUID();
}

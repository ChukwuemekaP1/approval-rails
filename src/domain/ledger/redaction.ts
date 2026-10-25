const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /pin/i,
  /secret/i,
  /token/i,
  /challenge/i,
  /credential/i,
  /authorization/i,
  /private/i,
  /apikey/i,
  /api_key/i,
];

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

export function sanitizePayload(payload: unknown): Record<string, unknown> {
  if (payload === null || typeof payload !== 'object') {
    return {};
  }

  if (Array.isArray(payload)) {
    return { items: payload.map((item) => sanitizeValue(item)) };
  }

  const obj = payload as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeValue(value);
    }
  }

  return sanitized;
}

function sanitizeValue(val: unknown): unknown {
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map((item) => sanitizeValue(item));
  }
  return sanitizePayload(val);
}

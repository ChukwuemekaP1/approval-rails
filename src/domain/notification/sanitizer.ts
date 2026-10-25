import { NotificationPayload, NotificationEventType } from './types';

const PROHIBITED_KEYS = [
  'password',
  'pin',
  'secret',
  'token',
  'credential',
  'challenge',
  'prompt',
  'private',
  'key',
  'auth',
];

export function sanitizeNotificationPayload(input: {
  eventType: NotificationEventType;
  workspaceId: string;
  resourceId: string;
  summary: string;
  occurredAt?: string;
  amountMinor?: string | bigint;
  currency?: string;
  merchant?: string;
  reason?: string;
  [key: string]: unknown;
}): NotificationPayload {
  const payload: NotificationPayload = {
    eventType: input.eventType,
    workspaceId: input.workspaceId,
    resourceId: input.resourceId,
    occurredAt: input.occurredAt || new Date().toISOString(),
    summary: String(input.summary || '').slice(0, 255),
  };

  if (input.amountMinor !== undefined) {
    payload.amountMinor = String(input.amountMinor);
  }
  if (input.currency) {
    payload.currency = String(input.currency);
  }
  if (input.merchant) {
    payload.merchant = String(input.merchant).slice(0, 100);
  }
  if (input.reason) {
    payload.reason = String(input.reason).slice(0, 255);
  }

  // Defensively ensure no prohibited keys leaked into any nested fields
  for (const key of Object.keys(input)) {
    const lower = key.toLowerCase();
    if (PROHIBITED_KEYS.some((p) => lower.includes(p))) {
      delete (payload as unknown as Record<string, unknown>)[key];
    }
  }

  return payload;
}

export function maskWebhookUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.length < 16) return '********';
  try {
    const parsed = new URL(trimmed);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return `${parsed.origin}/${pathParts[0]}/.../***`;
    }
    return `${parsed.origin}/***`;
  } catch {
    return 'https://***[REDACTED]***';
  }
}

import { getEnv } from '@/infrastructure/config/env';
import { baseLogger } from '@/infrastructure/logging/logger';
import { PayPalTimeoutError } from '@/domain/payment/errors';

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

export class PayPalClient {
  private get baseUrl(): string {
    const env = getEnv();
    if (env.PAYPAL_API_BASE_URL) return env.PAYPAL_API_BASE_URL;
    return env.PAYPAL_MODE === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now + 60000) {
      return cachedToken.accessToken;
    }

    const env = getEnv();
    if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials not configured');
    }

    const auth = Buffer.from(
      `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const res = await this.fetchWithTimeout(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      timeoutMs: 10000,
    });

    if (!res.ok) {
      const errText = await res.text();
      baseLogger.error({ status: res.status }, 'PayPal OAuth token fetch failed');
      throw new Error(`PayPal OAuth failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    cachedToken = {
      accessToken: data.access_token,
      expiresAt: now + (data.expires_in || 3600) * 1000,
    };
    return cachedToken.accessToken;
  }

  async request<T>(
    endpoint: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: unknown;
      timeoutMs?: number;
    } = {}
  ): Promise<T> {
    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const res = await this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      timeoutMs: options.timeoutMs ?? 15000,
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      baseLogger.warn({ status: res.status, endpoint }, 'PayPal API error response');
      const error = new Error(`PayPal API error: HTTP ${res.status}`);
      (error as any).status = res.status;
      (error as any).details = errorJson;
      throw error;
    }

    return (await res.json()) as T;
  }

  private async fetchWithTimeout(url: string, options: any): Promise<Response> {
    const { timeoutMs = 15000, ...fetchOpts } = options;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, { ...fetchOpts, signal: controller.signal });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new PayPalTimeoutError(`PayPal request timed out after ${timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const payPalClient = new PayPalClient();

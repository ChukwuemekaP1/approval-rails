import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/infrastructure/config/env';
import dns from 'dns/promises';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const env = getEnv();
  const isConfigured = Boolean(env.CHANNEL3_API_KEY && env.CHANNEL3_API_KEY.trim().length > 0);
  const redactedKey = env.CHANNEL3_API_KEY
    ? `${env.CHANNEL3_API_KEY.slice(0, 4)}...${env.CHANNEL3_API_KEY.slice(-4)}`
    : null;

  let dnsResolved = false;
  let resolvedIps: string[] = [];
  try {
    const addresses = await dns.resolve4('api.trychannel3.com');
    dnsResolved = addresses.length > 0;
    resolvedIps = addresses;
  } catch (err: any) {
    dnsResolved = false;
  }

  if (!isConfigured) {
    return NextResponse.json({
      provider: 'channel3',
      configured: false,
      redactedKey: null,
      dnsResolved,
      resolvedIps,
      status: 'UNCONFIGURED',
      error: 'CHANNEL3_API_KEY is not configured in environment variables.',
    });
  }

  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(`${env.CHANNEL3_BASE_URL}/v1/search`, {
      method: 'POST',
      headers: {
        'x-api-key': env.CHANNEL3_API_KEY!,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query: 'laptop', limit: 1 }),
      signal: controller.signal,
      cache: 'no-store',
    });

    const latencyMs = Date.now() - start;
    const json = await res.json().catch(() => ({}));
    const productsCount = (json.products || json.items || []).length;

    return NextResponse.json({
      provider: 'channel3',
      configured: true,
      redactedKey,
      dnsResolved,
      resolvedIps,
      status: res.ok ? 'OPERATIONAL' : 'ERROR',
      httpStatus: res.status,
      latencyMs,
      resultCount: productsCount,
    });
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    const isTimeout = err.name === 'AbortError' || latencyMs >= 3500;
    return NextResponse.json({
      provider: 'channel3',
      configured: true,
      redactedKey,
      dnsResolved,
      resolvedIps,
      status: 'UNAVAILABLE',
      httpStatus: null,
      latencyMs,
      error: isTimeout
        ? 'Connection timeout (Local network TCP socket to AWS API Gateway dropped/timed out)'
        : err.message,
      environmentNote: 'Local network egress blocked. Cloud deployment (Render) uses direct AWS peering.',
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

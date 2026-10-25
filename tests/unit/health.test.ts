import { describe, it, expect, vi } from 'vitest';
import { GET as healthHandler } from '@/app/api/v1/health/route';
import { GET as readinessHandler } from '@/app/api/v1/readiness/route';
import { NextRequest } from 'next/server';
import * as dbHealth from '@/infrastructure/db/health';

describe('Health and Readiness Probes', () => {
  it('GET /api/v1/health returns 200 with service metadata and correlationId', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/health', {
      headers: {
        'x-correlation-id': 'custom-corr-111',
      },
    });

    const res = await healthHandler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Correlation-Id')).toBe('custom-corr-111');

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.service).toBe('approve-rail');
    expect(json.correlationId).toBe('custom-corr-111');
    expect(json.timestamp).toBeDefined();
  });

  it('GET /api/v1/readiness returns 200 when database check succeeds', async () => {
    vi.spyOn(dbHealth, 'checkDatabaseReadiness').mockResolvedValueOnce({
      isReady: true,
      latencyMs: 8,
    });

    const req = new NextRequest('http://localhost:3000/api/v1/readiness');
    const res = await readinessHandler(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ready');
    expect(json.database.status).toBe('connected');
    expect(json.database.latencyMs).toBe(8);
  });

  it('GET /api/v1/readiness returns 503 and reports unready when database check fails', async () => {
    vi.spyOn(dbHealth, 'checkDatabaseReadiness').mockResolvedValueOnce({
      isReady: false,
      latencyMs: 2500,
      error: 'connect ECONNREFUSED 127.0.0.1:5432',
    });

    const req = new NextRequest('http://localhost:3000/api/v1/readiness');
    const res = await readinessHandler(req);

    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.status).toBe('unready');
    expect(json.database.status).toBe('disconnected');
    expect(json.database.error).toBe('connect ECONNREFUSED 127.0.0.1:5432');
  });
});

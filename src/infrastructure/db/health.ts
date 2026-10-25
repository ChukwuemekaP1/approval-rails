import { getDbPool } from './index';

export interface DatabaseReadinessResult {
  isReady: boolean;
  latencyMs: number;
  error?: string;
}

export async function checkDatabaseReadiness(timeoutMs: number = 2500): Promise<DatabaseReadinessResult> {
  const start = Date.now();
  try {
    const pool = getDbPool();

    // Use a timeout race to guarantee prompt response even if host is unreachable
    const queryPromise = pool.query('SELECT 1 AS alive;');
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Database check timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    await Promise.race([queryPromise, timeoutPromise]);
    const latencyMs = Date.now() - start;

    return {
      isReady: true,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return {
      isReady: false,
      latencyMs,
      error: errorMessage,
    };
  }
}

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_URL: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/approve_rail'),
  DATABASE_POOL_MIN: z.coerce.number().int().nonnegative().default(1),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
  SESSION_SECRET: z.string().min(32).default('c68e1fae792e4be0bb59e66ffb28795c643b469cb98f483c9d747d5267cb72c8'),
  WEBAUTHN_RP_ID: z.string().default('localhost'),
  WEBAUTHN_RP_NAME: z.string().default('ApproveRail'),
  WEBAUTHN_ORIGIN: z.string().default('http://localhost:3000'),
  CHANNEL3_API_KEY: z.string().optional(),
  CHANNEL3_BASE_URL: z.string().url().default('https://api.trychannel3.com'),
  CATALOG_PROVIDER: z.enum(['channel3', 'fixture', 'auto']).default('auto'),
  GEMINI_API_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | null = null;

export function validateEnv(rawEnv: Record<string, string | undefined> = process.env): ServerEnv {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${issues}`);
  }
  return result.data;
}

export function getEnv(): ServerEnv {
  if (!cachedEnv || process.env.NODE_ENV === 'test') {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

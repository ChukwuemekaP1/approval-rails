import { NextRequest, NextResponse } from 'next/server';
import { payPalWebhookUseCase } from '@/application/payment/webhook-use-case';
import { getOrCreateCorrelationId } from '@/lib/correlation';
import { baseLogger } from '@/infrastructure/logging/logger';
import { WebhookSignatureVerificationError } from '@/domain/payment/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);

  try {
    const rawBody = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const result = await payPalWebhookUseCase.execute({
      headers,
      rawBody,
    });

    return NextResponse.json(
      { received: true, ...result },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      }
    );
  } catch (error: any) {
    if (error instanceof WebhookSignatureVerificationError) {
      baseLogger.warn({ correlationId }, 'Rejected PayPal webhook with invalid signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400, headers: { 'X-Correlation-Id': correlationId } }
      );
    }

    if (error?.status === 503) {
      baseLogger.error({ correlationId }, 'PayPal webhook configuration missing in deployed environment');
      return NextResponse.json(
        { error: 'Webhook receiver unconfigured', retryable: true },
        {
          status: 503,
          headers: { 'Retry-After': '300', 'X-Correlation-Id': correlationId },
        }
      );
    }

    baseLogger.error({ correlationId, err: error.message }, 'Unhandled error processing PayPal webhook');
    return NextResponse.json(
      { error: 'Error processing webhook event' },
      { status: 500, headers: { 'X-Correlation-Id': correlationId } }
    );
  }
}

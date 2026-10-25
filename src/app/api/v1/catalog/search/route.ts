import { NextRequest, NextResponse } from 'next/server';
import { discoveryService } from '@/infrastructure/adapters/channel3/discovery-service';
import { toProblemDetailsResponse } from '@/infrastructure/errors/api-error';
import { getOrCreateCorrelationId } from '@/lib/correlation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;

    const results = await discoveryService.search({ query, category, limit });

    // Format BigInt values to string for JSON serialization
    const serializedProducts = results.products.map((p) => ({
      ...p,
      minPriceMinor: String(p.minPriceMinor),
      maxPriceMinor: String(p.maxPriceMinor),
      offers: p.offers.map((o) => ({
        ...o,
        priceMinor: String(o.priceMinor),
      })),
    }));

    return NextResponse.json(
      {
        ...results,
        products: serializedProducts,
      },
      { headers: { 'X-Correlation-Id': correlationId } }
    );
  } catch (error) {
    return toProblemDetailsResponse(error, { instance: request.nextUrl.pathname, correlationId });
  }
}

import { eq, desc } from 'drizzle-orm';
import { getDb } from '../db';
import { orders, webhookEvents } from '../db/schema';
import { Order, PaymentStatus } from '@/domain/payment/types';

export class OrderRepository {
  private get db() {
    return getDb();
  }

  async create(order: Order): Promise<Order> {
    const [row] = await this.db
      .insert(orders)
      .values({
        id: order.id,
        workspaceId: order.workspaceId,
        principalId: order.principalId,
        proposalId: order.proposalId,
        paypalOrderId: order.paypalOrderId,
        status: order.status,
        intent: order.intent,
        currency: order.currency,
        amountMinor: order.amountMinor,
        merchant: order.merchant,
        idempotencyKey: order.idempotencyKey,
        approvalUrl: order.approvalUrl,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })
      .returning();
    return this.mapToDomain(row);
  }

  async findById(id: string): Promise<Order | null> {
    const [row] = await this.db.select().from(orders).where(eq(orders.id, id));
    return row ? this.mapToDomain(row) : null;
  }

  async findByProposalId(proposalId: string): Promise<Order | null> {
    const [row] = await this.db.select().from(orders).where(eq(orders.proposalId, proposalId));
    return row ? this.mapToDomain(row) : null;
  }

  async findByPayPalOrderId(paypalOrderId: string): Promise<Order | null> {
    const [row] = await this.db.select().from(orders).where(eq(orders.paypalOrderId, paypalOrderId));
    return row ? this.mapToDomain(row) : null;
  }

  async listByWorkspace(workspaceId: string): Promise<Order[]> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(eq(orders.workspaceId, workspaceId))
      .orderBy(desc(orders.createdAt));
    return rows.map((r: any) => this.mapToDomain(r));
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    extra: Partial<Order> = {},
    client?: any
  ): Promise<Order> {
    const activeClient = client || this.db;
    const [row] = await activeClient
      .update(orders)
      .set({
        status,
        captureId: extra.captureId,
        capturedAt: extra.capturedAt,
        failureReason: extra.failureReason,
        reconciledAt: extra.reconciledAt,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return this.mapToDomain(row);
  }

  async saveWebhookEvent(data: {
    eventId: string;
    eventType: string;
    resourceType: string;
    summary?: string;
    rawPayload: string;
  }): Promise<boolean> {
    const result = await this.db
      .insert(webhookEvents)
      .values({
        eventId: data.eventId,
        eventType: data.eventType,
        resourceType: data.resourceType,
        summary: data.summary,
        rawPayload: data.rawPayload,
      })
      .onConflictDoNothing({ target: webhookEvents.eventId });
    return (result as any).rowCount > 0;
  }

  async markWebhookProcessed(eventId: string): Promise<void> {
    await this.db
      .update(webhookEvents)
      .set({ processed: true, processedAt: new Date() })
      .where(eq(webhookEvents.eventId, eventId));
  }

  private mapToDomain(row: any): Order {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      principalId: row.principalId,
      proposalId: row.proposalId,
      paypalOrderId: row.paypalOrderId,
      status: row.status as PaymentStatus,
      intent: row.intent as 'CAPTURE',
      currency: row.currency,
      amountMinor: BigInt(row.amountMinor),
      merchant: row.merchant,
      idempotencyKey: row.idempotencyKey,
      approvalUrl: row.approvalUrl,
      captureId: row.captureId,
      capturedAt: row.capturedAt,
      failureReason: row.failureReason,
      reconciledAt: row.reconciledAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

export const orderRepository = new OrderRepository();

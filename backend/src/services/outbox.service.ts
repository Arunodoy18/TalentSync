import type { Pool } from "pg";

export async function enqueueOutboxEvent(args: {
  db: Pool;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
}) {
  await args.db.query(
    `insert into event_outbox(aggregate_type, aggregate_id, event_type, payload, status, attempts, available_at)
     values($1, $2, $3, $4, 'pending', 0, now())`,
    [args.aggregateType, args.aggregateId, args.eventType, args.payload]
  );
}

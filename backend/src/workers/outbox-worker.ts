import "dotenv/config";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: databaseUrl });
const POLL_MS = 3000;
const MAX_ATTEMPTS = 8;

async function processBatch() {
  const client = await pool.connect();
  try {
    await client.query("begin");

    const result = await client.query(
      `select id, aggregate_type, aggregate_id, event_type, payload, attempts
       from event_outbox
       where status = 'pending' and available_at <= now()
       order by created_at asc
       limit 20
       for update skip locked`
    );

    for (const row of result.rows) {
      try {
        // Replace with real broker publish (Redis/Kafka/SNS/SQS) in production.
        console.log("outbox.publish", {
          id: row.id,
          aggregateType: row.aggregate_type,
          aggregateId: row.aggregate_id,
          eventType: row.event_type,
        });

        await client.query(
          `update event_outbox
           set status = 'published', published_at = now(), attempts = attempts + 1
           where id = $1`,
          [row.id]
        );
      } catch (error) {
        const attempts = Number(row.attempts ?? 0) + 1;
        const shouldFail = attempts >= MAX_ATTEMPTS;
        const backoffSeconds = Math.min(300, 2 ** attempts);

        await client.query(
          `update event_outbox
           set status = $2,
               attempts = $3,
               available_at = now() + make_interval(secs => $4)
           where id = $1`,
          [row.id, shouldFail ? "failed" : "pending", attempts, backoffSeconds]
        );

        console.error("outbox.publish.error", {
          id: row.id,
          attempts,
          error: error instanceof Error ? error.message : "unknown",
        });
      }
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    console.error("outbox.batch.error", error);
  } finally {
    client.release();
  }
}

async function main() {
  console.log("outbox worker started");
  for (;;) {
    await processBatch();
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
